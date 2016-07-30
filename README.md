[![license](https://img.shields.io/npm/l/starbound.js.svg?style=flat-square)](https://www.npmjs.com/package/starbound.js)
[![npm version](https://img.shields.io/npm/v/starbound.js.svg?style=flat-square)](https://www.npmjs.com/package/starbound.js)
[![npm downloads](https://img.shields.io/npm/dm/starbound.js.svg?style=flat-square)](https://www.npmjs.com/package/starbound.js)

# starbound.js
A Starbound RCON client

This client is fairly barebones at the moment as it's under active development.
However, some basic functionality is working...

## Install
Install via npm:

```bash
npm install --save starbound.js
```

## Example Code
Here's some sample code to get you started...

```javascript
var Starbound = require('starbound.js');

var sb = new Starbound(host, port);
sb.connect('password', function(successful) {
  sb.listUsers(function(message) {
    message.users.forEach(function(info) {
      console.log(info.clientId, info.username, info.uuid);
    });
  });
});
```

## Supported Commands
The following commands are supported:

* `sb.broadcast(message, callback)`
  > Broadcasts `message` to all players. The optional `callback` will be called
  > after the message is sent.

* `sb.listUsers(callback)`
  > `function callback(message)`
  > * `message.users` is an array of `{clientId, username, uuid}` objects.

* `sb.sendCommand(command, callback)`
  > For forward compatibility, sends `command` to the server.
  > `function callback(message)`
  > * `message.body` contains the response from the server.

