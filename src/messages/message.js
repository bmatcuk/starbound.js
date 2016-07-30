export default class Message {
  constructor(id, type, body) {
    this.id = id;
    this.type = type;
    this.body = body;
  }

  setBody(body) {
    this.body = body;
  }

  toBuffer() {
    const len = 10 + Buffer.byteLength(this.body);
    const buf = new Buffer(len + 4);
    let pos = buf.writeInt32LE(len, 0);        // length
    pos = buf.writeInt32LE(this.id, pos);     // id
    pos = buf.writeInt32LE(this.type, pos);   // type
    pos = pos + buf.write(this.body, pos);    // body
    buf.writeInt16LE(0, pos);                  // 2 null terminators
    return buf;
  }

  static fromBuffer(buf, bodyLength, id, offset=0) {
    const type = buf.readInt32LE(offset);
    let body = '';
    if (bodyLength > 0)
      body = buf.toString('utf8', offset + 4, offset + 4 + bodyLength);

    return new this(id, type, body);
  }
}

