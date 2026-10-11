const { gzipSync } = require("zlib");
const { BINARY_TYPE, CodecError } = require("./codec");
const { wantsBinary, sentBinary, toRecords } = require("./sync");

/**
 * Builds the reply to a positions request.
 * - No Accept: application/octet-stream -> JSON payload (standard format).
 * - With Accept: application/octet-stream -> binary frame, gzipped if accepted and smaller.
 */
function positionsReply(input) {
  const now = input.now ?? Date.now();
  const extra = { ...(input.extra ?? {}), ...(input.index && input.index.length ? { index: input.index } : {}) };
  const vary = "Accept, Accept-Encoding";

  if (!wantsBinary(input.accept)) {
    const payload = {
      ...extra,
      serverTime: new Date(now).toISOString(),
      positions: toRecords(input.codec, input.positions)
    };
    return {
      status: 200,
      form: "json",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        Vary: vary
      },
      body: JSON.stringify(payload)
    };
  }

  const numbered = input.positions.map((p) => {
    const n = p.n !== undefined ? p.n : input.table.assign(p.id);
    return { ...p, n };
  });

  const frame = input.codec.encodeFrame(numbered, {
    serverTime: now,
    json: Object.keys(extra).length ? extra : undefined
  });

  const headers = {
    "Content-Type": BINARY_TYPE,
    "Cache-Control": "no-store",
    Vary: vary
  };

  if (/\bgzip\b/i.test(input.acceptEncoding ?? "")) {
    const zipped = gzipSync(frame);
    if (zipped.length < frame.length) {
      return {
        status: 200,
        form: "binary+gzip",
        headers: { ...headers, "Content-Encoding": "gzip" },
        body: zipped
      };
    }
  }

  return { status: 200, form: "binary", headers, body: Buffer.from(frame) };
}

/**
 * Reads one uploaded point: binary (Content-Type octet-stream) or JSON.
 */
function readPointBody(codec, contentType, body) {
  try {
    if (sentBinary(contentType)) {
      const bytes = Buffer.isBuffer(body) ? new Uint8Array(body) : (body instanceof Uint8Array ? body : new Uint8Array(Buffer.from(body)));
      return { ok: true, binary: true, point: codec.decodePoint(bytes) };
    }
    const jsonStr = Buffer.isBuffer(body) ? body.toString("utf-8") : (typeof body === "string" ? body : JSON.stringify(body));
    const json = typeof body === "object" && !Buffer.isBuffer(body) && !(body instanceof Uint8Array) ? body : JSON.parse(jsonStr);

    const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
    const lat = num(json.lat);
    const lon = num(json.lon ?? json.lng);
    if (lat === undefined || lon === undefined || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return { ok: false, error: "bad_position" };
    }
    const point = { lat, lon, ageSec: num(json.ageSec) ?? 0 };
    if (num(json.speed) !== undefined) point.speed = num(json.speed);
    if (num(json.heading) !== undefined) point.heading = num(json.heading);
    if (typeof json.id === "string") point.id = json.id;
    return { ok: true, binary: false, point };
  } catch (error) {
    return { ok: false, error: error instanceof CodecError ? "bad_body" : "bad_json" };
  }
}

/**
 * Express adapter: sendReply(res, reply).
 */
function sendReply(res, reply) {
  res.statusCode = reply.status;
  for (const [k, v] of Object.entries(reply.headers)) {
    res.setHeader(k, v);
  }
  res.end(reply.body);
}

module.exports = {
  positionsReply,
  readPointBody,
  sendReply
};
