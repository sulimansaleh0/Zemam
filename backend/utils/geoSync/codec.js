const { CodecError, Reader, Writer } = require("./bytes");

const BINARY_TYPE = "application/octet-stream";
const FORMAT_VERSION = 1;

const KIND_FRAME = 1;
const KIND_POINT = 2;
const KIND_POINT_UUID = 3;
const KIND_POINT_TEXT = 4;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TEXT_ID = /^[\x21-\x7e]{1,64}$/;
const MAX_JSON = 4 * 1024 * 1024;
const MAX_POINTS = 100000;
const MAX_AGE_SEC = 2 ** 32;
const MAX_TIME_MS = 8.64e15;

const validLatLon = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

function createCodec(options) {
  const scale = options.scale ?? 1e5;
  const offsetBytes = options.offsetBytes ?? 2;
  const speedStep = options.speedStep ?? 0.25;
  const withHeading = options.heading ?? false;
  const profile = options.profile ?? 0;

  if (!(scale > 0) || !Number.isFinite(scale)) throw new RangeError("scale must be a positive number");
  if (offsetBytes !== 2 && offsetBytes !== 3) throw new RangeError("offsetBytes must be 2 or 3");
  if (!(speedStep >= 0)) throw new RangeError("speedStep must be >= 0");
  if (!Number.isInteger(profile) || profile < 0 || profile > 255) throw new RangeError("profile must be 0-255");
  if (!validLatLon(options.south, options.west)) throw new RangeError("bad origin");
  if (180 * scale > 2 ** 52) throw new RangeError("scale too large");

  const originLat = Math.round(options.south * scale);
  const originLon = Math.round(options.west * scale);
  const maxOffset = 256 ** offsetBytes - 1;
  const flagSpan = withHeading ? 8 : 4;

  const quantise = (deg) => Math.round(deg * scale);
  const round = (deg) => quantise(deg) / scale;

  function writePoint(w, p) {
    if (!validLatLon(p.lat, p.lon)) throw new CodecError("bad coordinates");
    const lat = quantise(p.lat);
    const lon = quantise(p.lon);
    const dLat = lat - originLat;
    const dLon = lon - originLon;
    const inside = dLat >= 0 && dLat <= maxOffset && dLon >= 0 && dLon <= maxOffset;
    const hasSpeed = speedStep > 0 && p.speed != null && Number.isFinite(p.speed) && p.speed >= 0;
    const hasHeading = withHeading && p.heading != null && Number.isFinite(p.heading);
    const age = Number.isFinite(p.ageSec) ? Math.min(MAX_AGE_SEC, Math.max(0, Math.floor(p.ageSec))) : 0;
    w.varint(age * flagSpan + (hasHeading ? 4 : 0) + (inside ? 0 : 2) + (hasSpeed ? 1 : 0));
    if (inside) {
      w.uint(dLat, offsetBytes);
      w.uint(dLon, offsetBytes);
    } else {
      w.zigzag(lat);
      w.zigzag(lon);
    }
    if (hasSpeed) w.u8(Math.min(255, Math.round(p.speed / speedStep)));
    if (hasHeading) w.u8(Math.round(((((p.heading % 360) + 360) % 360) * (256 / 360)) & 0xff));
  }

  function readPoint(r) {
    const head = r.varint();
    const flags = head % flagSpan;
    const ageSec = Math.floor(head / flagSpan);
    if (ageSec > MAX_AGE_SEC) throw new CodecError("age too large");
    const hasSpeed = (flags & 1) !== 0;
    const outside = (flags & 2) !== 0;
    const hasHeading = (flags & 4) !== 0;
    if (hasSpeed && speedStep === 0) throw new CodecError("speed not in this profile");
    const lat = outside ? r.zigzag() : originLat + r.uint(offsetBytes);
    const lon = outside ? r.zigzag() : originLon + r.uint(offsetBytes);
    if (!validLatLon(lat / scale, lon / scale)) throw new CodecError("bad coordinates");
    const point = { lat: lat / scale, lon: lon / scale, ageSec };
    if (hasSpeed) point.speed = r.u8() * speedStep;
    if (hasHeading) point.heading = (r.u8() * 360) / 256;
    return point;
  }

  function writeHeader(w, kind) {
    w.u8((FORMAT_VERSION << 4) | kind);
    w.u8(profile);
  }

  function readHeader(r) {
    const byte = r.u8();
    if (byte >> 4 !== FORMAT_VERSION) throw new CodecError(`unknown version ${byte >> 4}`);
    if (r.u8() !== profile) throw new CodecError("another profile");
    return byte & 0x0f;
  }

  function encodeFrame(positions, opts = {}) {
    const serverTime = Math.floor(opts.serverTime ?? Date.now());
    if (!(serverTime >= 0 && serverTime <= MAX_TIME_MS)) throw new CodecError("bad serverTime");
    const json = opts.json === undefined ? new Uint8Array() : Buffer.from(JSON.stringify(opts.json), "utf-8");
    if (json.length > MAX_JSON) throw new CodecError("json too long");
    const w = new Writer();
    writeHeader(w, KIND_FRAME);
    w.varint(serverTime);
    w.varint(json.length);
    w.raw(json);
    const sorted = [...positions].sort((a, b) => a.n - b.n);
    w.varint(sorted.length);
    let previous = 0;
    for (const [i, p] of sorted.entries()) {
      if (!Number.isSafeInteger(p.n) || p.n < 0 || (i > 0 && p.n <= previous)) {
        throw new CodecError(`bad or repeated number ${p.n}`);
      }
      w.varint(p.n - previous);
      previous = p.n;
      const at = typeof p.at === "number" ? p.at : new Date(p.at).getTime();
      writePoint(w, {
        lat: p.lat,
        lon: p.lon,
        speed: p.speed,
        heading: p.heading,
        ageSec: Math.max(0, (serverTime - at) / 1000)
      });
    }
    return w.done();
  }

  function decodeFrame(bytes) {
    const r = new Reader(bytes);
    if (readHeader(r) !== KIND_FRAME) throw new CodecError("not a sync frame");
    const serverTime = r.varint();
    if (serverTime > MAX_TIME_MS) throw new CodecError("bad serverTime");
    const length = r.varint();
    if (length > MAX_JSON) throw new CodecError("json too long");
    let json;
    if (length > 0) {
      try {
        json = JSON.parse(Buffer.from(r.bytes(length)).toString("utf-8"));
      } catch (error) {
        throw error instanceof CodecError ? error : new CodecError("bad json part");
      }
    }
    const count = r.varint();
    if (count > MAX_POINTS) throw new CodecError("too many points");
    const points = [];
    let n = 0;
    for (let i = 0; i < count; i++) {
      const gap = r.varint();
      if (i > 0 && gap === 0) throw new CodecError("repeated number");
      n += gap;
      if (!Number.isSafeInteger(n)) throw new CodecError("number too large");
      const p = readPoint(r);
      points.push({ n, ...p, at: serverTime - p.ageSec * 1000 });
    }
    r.end();
    return { serverTime, json, points };
  }

  function encodePoint(p, id) {
    const w = new Writer();
    if (id === undefined) {
      writeHeader(w, KIND_POINT);
    } else if (UUID.test(id)) {
      writeHeader(w, KIND_POINT_UUID);
      const hex = id.replace(/-/g, "");
      for (let i = 0; i < 32; i += 2) w.u8(parseInt(hex.slice(i, i + 2), 16));
    } else {
      if (!TEXT_ID.test(id)) throw new CodecError("bad id");
      writeHeader(w, KIND_POINT_TEXT);
      const enc = Buffer.from(id, "utf-8");
      w.u8(enc.length);
      w.raw(enc);
    }
    writePoint(w, p);
    return w.done();
  }

  function decodePoint(bytes) {
    const r = new Reader(bytes);
    const kind = readHeader(r);
    let id;
    if (kind === KIND_POINT_UUID) {
      const hex = Array.from(r.bytes(16), (b) => b.toString(16).padStart(2, "0")).join("");
      id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } else if (kind === KIND_POINT_TEXT) {
      const length = r.u8();
      if (length < 1 || length > 64) throw new CodecError("bad id");
      id = Buffer.from(r.bytes(length)).toString("utf-8");
      if (!TEXT_ID.test(id)) throw new CodecError("bad id");
    } else if (kind !== KIND_POINT) {
      throw new CodecError("not a point");
    }
    const p = readPoint(r);
    r.end();
    return id === undefined ? p : { id, ...p };
  }

  return {
    options: { south: options.south, west: options.west, scale, offsetBytes, speedStep, heading: withHeading, profile },
    box: [originLat / scale, originLon / scale, (originLat + maxOffset) / scale, (originLon + maxOffset) / scale],
    round,
    encodeFrame,
    decodeFrame,
    encodePoint,
    decodePoint
  };
}

const GAZA = { south: 31.2, west: 34.2 };

module.exports = {
  BINARY_TYPE,
  FORMAT_VERSION,
  CodecError,
  createCodec,
  GAZA
};
