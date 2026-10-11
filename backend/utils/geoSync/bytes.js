// Byte-level reader and writer for compact binary protocol.
// Bounds-checked; failures throw CodecError.

class CodecError extends Error {
  constructor(message) {
    super(message);
    this.name = "CodecError";
  }
}

class Writer {
  constructor() {
    this.buf = new Uint8Array(64);
    this.len = 0;
  }

  grow(extra) {
    if (this.len + extra <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.len + extra) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.len));
    this.buf = next;
  }

  u8(n) {
    this.grow(1);
    this.buf[this.len++] = n & 0xff;
  }

  /** Unsigned big-endian integer of 2 or 3 bytes. */
  uint(n, bytes) {
    this.grow(bytes);
    for (let i = bytes - 1; i >= 0; i--) {
      this.buf[this.len++] = Math.floor(n / 2 ** (8 * i)) & 0xff;
    }
  }

  /** Unsigned LEB128, any safe integer. */
  varint(n) {
    if (!Number.isSafeInteger(n) || n < 0) throw new CodecError(`varint out of range: ${n}`);
    this.grow(8);
    while (n >= 0x80) {
      this.buf[this.len++] = (n % 0x80) | 0x80;
      n = Math.floor(n / 0x80);
    }
    this.buf[this.len++] = n;
  }

  /** Signed integer as a zigzag varint. */
  zigzag(n) {
    this.varint(n >= 0 ? n * 2 : -n * 2 - 1);
  }

  raw(b) {
    this.grow(b.length);
    this.buf.set(b, this.len);
    this.len += b.length;
  }

  done() {
    return this.buf.slice(0, this.len);
  }
}

class Reader {
  constructor(b) {
    this.b = b instanceof Uint8Array ? b : new Uint8Array(b);
    this.off = 0;
  }

  need(n) {
    if (this.off + n > this.b.length) throw new CodecError("truncated");
  }

  u8() {
    this.need(1);
    return this.b[this.off++];
  }

  uint(bytes) {
    this.need(bytes);
    let v = 0;
    for (let i = 0; i < bytes; i++) v = v * 256 + this.b[this.off++];
    return v;
  }

  /** At most 8 bytes (56 bits): anything longer is refused. */
  varint() {
    let value = 0;
    let scale = 1;
    for (let i = 0; i < 8; i++) {
      const byte = this.u8();
      value += (byte & 0x7f) * scale;
      if (byte < 0x80) {
        if (!Number.isSafeInteger(value)) break;
        return value;
      }
      scale *= 0x80;
    }
    throw new CodecError("varint too long");
  }

  zigzag() {
    const z = this.varint();
    return z % 2 === 0 ? z / 2 : -(z + 1) / 2;
  }

  bytes(n) {
    this.need(n);
    const out = this.b.subarray(this.off, this.off + n);
    this.off += n;
    return out;
  }

  /** Refuses trailing bytes. */
  end() {
    if (this.off !== this.b.length) throw new CodecError("trailing bytes");
  }
}

module.exports = {
  CodecError,
  Writer,
  Reader
};
