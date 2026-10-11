const { BINARY_TYPE } = require("./codec");

class IndexTable {
  constructor(entries = []) {
    this.byId = new Map();
    this.byN = new Map();
    this.next = 1;
    for (const [n, id] of entries) this.set(n, id);
  }

  set(n, id) {
    if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`bad number ${n}`);
    const old = this.byN.get(n);
    if (old !== undefined && old !== id) this.byId.delete(old);
    this.byId.set(id, n);
    this.byN.set(n, id);
    this.next = Math.max(this.next, n + 1);
  }

  assign(id) {
    const known = this.byId.get(id);
    if (known !== undefined) return known;
    const n = this.next++;
    this.set(n, id);
    return n;
  }

  numberOf(id) {
    return this.byId.get(id);
  }

  idOf(n) {
    return this.byN.get(n);
  }

  entries() {
    return [...this.byN.entries()].sort((a, b) => a[0] - b[0]);
  }

  get size() {
    return this.byN.size;
  }
}

function frameToPayload(frame, idOf) {
  const json = frame.json && typeof frame.json === "object" && !Array.isArray(frame.json) ? frame.json : {};
  const index = Array.isArray(json.index) ? json.index : [];
  const fromFrame = new Map(index.filter((e) => Array.isArray(e) && typeof e[0] === "number" && typeof e[1] === "string"));
  const positions = [];
  let unknown = 0;
  for (const p of frame.points) {
    const id = fromFrame.get(p.n) ?? idOf(p.n);
    if (id === undefined) {
      unknown++;
      continue;
    }
    const record = { id, lat: p.lat, lon: p.lon, at: new Date(p.at).toISOString() };
    if (p.speed != null) record.speed = p.speed;
    if (p.heading != null) record.heading = p.heading;
    positions.push(record);
  }
  return { payload: { ...json, serverTime: new Date(frame.serverTime).toISOString(), positions }, unknown };
}

function toRecords(codec, positions) {
  return positions.map((p) => {
    const r = { id: p.id, lat: codec.round(p.lat), lon: codec.round(p.lon), at: new Date(p.at).toISOString() };
    if (p.speed != null && Number.isFinite(p.speed)) r.speed = Math.round(p.speed * 100) / 100;
    if (p.heading != null && Number.isFinite(p.heading)) r.heading = Math.round(p.heading);
    return r;
  });
}

function wantsBinary(accept) {
  return (accept ?? "").toLowerCase().split(",").some((part) => {
    const [type, ...params] = part.trim().split(";");
    if (type?.trim() !== BINARY_TYPE) return false;
    const q = params.map((s) => s.trim()).find((s) => s.startsWith("q="));
    return q === undefined || Number(q.slice(2)) > 0;
  });
}

function sentBinary(contentType) {
  return (contentType ?? "").toLowerCase().trim().startsWith(BINARY_TYPE);
}

const SEND_MIN_METERS = 15;
const SEND_HEARTBEAT_MS = 60000;

function distanceMeters(a, b) {
  const dy = (b.lat - a.lat) * 111320;
  const dx = (b.lon - a.lon) * 111320 * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.hypot(dx, dy);
}

function worthSending(last, next, now, opts = {}) {
  if (!last || now - last.sentAt >= (opts.heartbeatMs ?? SEND_HEARTBEAT_MS)) return true;
  return distanceMeters(last, next) >= (opts.minMeters ?? SEND_MIN_METERS);
}

function fixAgeSec(fixAt, now, max = 60) {
  return Number.isFinite(fixAt) ? Math.min(max, Math.max(0, (now - fixAt) / 1000)) : 0;
}

module.exports = {
  IndexTable,
  frameToPayload,
  toRecords,
  wantsBinary,
  sentBinary,
  SEND_MIN_METERS,
  SEND_HEARTBEAT_MS,
  distanceMeters,
  worthSending,
  fixAgeSec
};
