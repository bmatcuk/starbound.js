import EventEmitter from 'events';
import {Socket} from 'net';
import Auth from './messages/auth';
import AuthResponse from './messages/auth-response';
import Broadcast from './messages/broadcast';
import Exec from './messages/exec';
import List from './messages/list';
import ListResponse from './messages/list-response';
import Response from './messages/response';

function close(hadError) {
  this._socket = null;
  this.emit('close', hadError);
}

function connect(password, userCallback) {
  const message = new Auth(this._getNextMessageId(), password);
  const callback = response => {
    delete this._callbacks[message.id];
    delete this._callbacks[-1];

    this.emit('connect', response.authSuccessful);
    if (userCallback)
      userCallback(response.authSuccessful);
  };

  // a failed login attempt will return with ID -1, so we need to register a
  // callback for that, in addition to a callback for the normal message id
  this._callbacks[-1] = {cb: callback, type: AuthResponse};
  this::send(message, callback, AuthResponse);
}

function data(buffer) {
  if (this._buffer)
    this._buffer = Buffer.concat([this._buffer, buffer]);
  else
    this._buffer = buffer;

  let offset = 0;
  if (this._buffer.length >= 4) {
    let len = this._buffer.readInt32LE(offset);
    while (this._buffer.length >= offset + len + 4) {
      let test = this._buffer.readInt16LE(offset + 4 + len - 2);
      if (test != 0) {
        this.emit('error', new Error('Received invalid data.'));
        this._buffer = null;
        return;
      }

      let bodyLength = len - 10;
      let id = this._buffer.readInt32LE(offset + 4);
      let message = null;
      if (this._callbacks[id]) {
        message = this._callbacks[id].type.fromBuffer(this._buffer, bodyLength, id, offset + 8);
        this._callbacks[message.id].cb(message);
        delete this._callbacks[message.id];
      } else {
        message = Response.fromBuffer(this._buffer, bodyLength, id, offset + 8);
      }
      this.emit('message', message);

      offset += len + 4;
      if (offset + 4 <= this._buffer.length)
        len = this._buffer.readInt32LE(offset);
    }
  }

  if (offset < this._buffer.length) {
    const buf = new Buffer(this._buffer.length - offset);
    this._buffer.copy(buf, 0, offset);
    this._buffer = buf;
  } else {
    this._buffer = null;
  }
}

function end() {
  this.disconnect();
  this.emit('end');
}

function send(message, callback, responseType=Response) {
  if (!this._socket)
    throw new Error("Client is not connected.");

  if (message.id && callback)
    this._callbacks[message.id] = {cb: callback, type: responseType};

  this._socket.write(message.toBuffer());
}


export default class Starbound extends EventEmitter {
  constructor(host='localhost', port=21026, options={}) {
    super();
    this._host = host;
    this._port = port;
    this._options = options;
    this._nextMessageId = 1;
    this._callbacks = {};
    this._buffer = null;
  }

  connect(password, callback) {
    if (this._socket)
      throw new Error("Client is already connected.");

    this._socket = new Socket();
    this._socket.on('close', this::close);
    this._socket.on('connect', connect.bind(this, password, callback));
    this._socket.on('data', this::data);
    this._socket.on('drain', this.emit.bind('drain'));
    this._socket.on('end', this::end);
    this._socket.on('error', this.emit.bind('error'));
    this._socket.on('lookup', this.emit.bind('lookup'));
    this._socket.on('timeout', this.emit.bind('timeout'));
    this._socket.setTimeout(this.timeout);

    this._socket.connect({
      port: this._port,
      host: this._host,
    });
  }

  disconnect() {
    if (!this._socket)
      throw new Error("Client is not connected.");

    this._socket.destroy();
  }

  get connected() { return !!this._socket; }

  get timeout() { return this._options.timeout || 0; }
  set timeout(t) {
    this._options.timeout = t;
    if (this._socket)
      this._socket.setTimeout(this.timeout);
  }

  _getNextMessageId() { return this._nextMessageId++; }

  broadcast(msg, callback) {
    const message = new Broadcast(this._getNextMessageId(), msg);
    this::send(message, callback);
  }

  listUsers(callback) {
    const message = new List(this._getNextMessageId());
    this::send(message, callback, ListResponse);
  }

  sendCommand(command, callback) {
    const message = new Exec(this._getNextMessageId(), command);
    this::send(message, callback);
  }
}

