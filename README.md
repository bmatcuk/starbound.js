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
sb.timeout = 30000;

sb.on('close', function(dueToError) {
  console.log('Connection to Starbound has been closed.');
});

sb.on('timeout', function() {
  console.log('Connection timed out.');
});

sb.on('error', function(err) {
  console.log("There's been an error:", err.message);
});

sb.connect('password', function(successful) {
  if (successful) {
    console.log('Successfully connected to Starbound');

    sb.listUsers(function(message) {
      message.users.forEach(function(info) {
        console.log(info.clientId, info.username, info.uuid);
      });
      sb.disconnect();
    });
  }
});
```

## Basic Functionality
Basic functionality is implemented by these functions:

* `new Starbound(host, port, options)`
  > Create a new instance of the Starbound RCON client.
  >
  > * `host` - the host to connect to _(default: localhost)_
  > * `port` - the port to connect to _(default: 21026)_
  > * `options`
  >   * `timeout` - socket timeout in milliseconds _(default: 0 meaning "never")_
  >     Note that this timeout only affects _our_ side of the connection.
  >     Starbound will timeout its side eventually.

* `sb.connect(password, callback)`
  > Connects to the server
  >
  > `function callback(success)` _(optional)_
  > * Called after attempting to connect. If `success` is true, authentication
  >   was successful.

* `sb.disconnect()`
  > Disconnect from the server.

* `sb.timeout`
  `sb.timeout = X`
  > Get or set the socket timeout in milliseconds (see `options.timeout` in the
  > constructor).

* `sb.connected`
  > Is `true` if the server is currently connected; `false` otherwise.

## Supported Commands
The following commands are supported. I can't find any "official" list of RCON
commands for Starbound, so I've only implemented the commands I'm aware of. If
I'm missing any, or if one of these commands no longer work, please submit an
[issue].

Please note: I haven't tested all of these functions... I haven't had a need
to kick or ban anyone from my server, for example =) If you have any issues,
please submit an [issue].

Each of these functions returns the "message id". This can be used to pair a
response with the message if you're listing to the `message` event (see
[Events] below).

* `sb.ban(user, reason, time, callback)`
  > Kicks and bans a `user` (which may be specified using the clientId, username,
  > or uuid returned by `listUsers()`) for `reason`. If `time` is specified, the
  > ban will be temporary and will automatically be lifted after `time` seconds
  > have passed. This is an optional parameter. For permanent bans, either pass
  > something falsey (`null`, `false`, `0`), or skip this parameter. Note: temp
  > bans might not survive a server restart.
  >
  > `function callback()` _(optional)_
  > * Called after the ban hammer falls.

* `sb.broadcast(message, callback)`
  > Broadcasts `message` to all players.
  >
  > `function callback()` _(optional)_
  > * Called after the broadcast is sent.

* `sb.echo(message, callback)`
  > The server will reply with `message`. Useful for "pinging" the server.
  >
  > `function callback(response)` _(optional)_
  > * `response.body` should be equal to `message`.

* `sb.kick(user, reason, callback)`
  > Kicks a `user` (which may be specified using the clientId, username, or
  > uuid returned by `listUsers()`) for `reason`.
  >
  > `function callback()` _(optional)_
  > * Called after the user has been kicked.

* `sb.listUsers(callback)`
  > Return a list of users that are currently logged in to the server.
  >
  > `function callback(response)` _(optional)_
  > * `response.users` is an array of `{clientId, username, uuid}` objects.
  > * `response.body` is the raw response from the server.

* `sb.sendCommand(command, callback)`
  > For forward compatibility: sends raw `command` to the server.
  >
  > `function callback(response)` _(optional)_
  > * `response.body` contains the raw response from the server, if any.

* `sb.serverReload(callback)`
  > Reload the server's assets (including mods). Does not reread the config.
  > Note: this will cause the server to appear to freeze for a few moments.
  >
  > `function callback()` _(optional)_
  > * Called after the reload.

* `sb.stopServer()`
  > Cleanly shuts down the server.

* `sb.timewarp(amount, callback)`
  > Jumps the entire server ahead in time by `amount`. `amount` is a positive
  > integer representing the number of seconds to jump ahead.
  >
  > `function callback()` _(optional)_
  > * Called after the timewarp.

* `sb.whereIs(user)`
  > Returns the coordinates of the `user` (may be specified via clientId,
  > username, or uuid as returned by `listUsers()`). These coordinates could
  > be used to `/warp` to the player in-game.
  >
  > `function callback(response)` _(optional)_
  > * `response.body` will have the coordinates.

* `sb.whisper(username, message, callback)`
  > Sends a private `message` (whisper) to the specified user via `username`.
  >
  > `function callback()` _(optional)_
  > * Called after the whisper is sent.

## Events
The client is an [EventEmitter].
The following events are fired from the client. Some of these events are
passed, unmolested, from the underlying [Socket].

* `close`
  > Connection to Starbound has closed.
  > * `hadError` - `true` if the connection closed due to an error.

* `connect`
  > Connection to Starbound has been opened.
  > * `successful` - `true` if authentication was successful.

* `data`
  > Data has been received on the socket
  > * `buffer` - received data as a [Buffer]

* `drain`
  > Write buffer is empty.

* `end`
  > Starbound closed the connection on its end. Starbound.js will automatically
  > disconnect in response.

* `error`
  > An error has occurred. Starbound.js will automatically disconnect.
  > * `err` - the Error that has occurred.

* `lookup`
  > Emitted after resolving the hostname, but before connecting. See
  > [dns.lookup()].
  > * `err` - if non-null, indicates a lookup error.
  > * `address` - the IP address of the host
  > * `family` - the address type

* `message`
  > Message received from Starbound. Messages are always in response to a
  > command you've sent, therefore, it's typically easier to pass in a
  > callback when you issue the command, rather than try to receive
  > responses via this event.
  > * `response` - the message has the following fields:
  >   * `response.id` - the id will match the "message id" of the command.
  >     Every [command] returns the message id. You can
  >     use this id to pair a response to the command you issued.
  >   * `response.body` - the raw server response

* `timeout`
  > Socket has timed out due to inactivity. User should disconnect manually.

## Some Additional Notes
If you plan on keeping a connection open to Starbound indefinitely, you'll need
to occasionally "ping" the server so that the server will keep the connection
alive. The easiest way to do this is to setup an interval to send the "echo"
command... something like:

```javascript
var Starbound = require('starbound.js');

var sb = new Starbound(host, port);

var interval = null;
function ping() {
  if (sb.connected)
    sb.echo('ping');
}

sb.on('close', function() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
});

sb.connect('password', function(success) {
  if (success) {
    // "ping" the server every 30 seconds
    interval = setInterval(ping, 30000);
  }

  // etc
});
```

I find 30 seconds works well.

[issue]: https://github.com/bmatcuk/starbound.js/issues
[command]: #supported-commands
[events]: #events
[EventEmitter]: https://nodejs.org/dist/latest-v4.x/docs/api/events.html#events_class_eventemitter
[Socket]: https://nodejs.org/dist/latest-v4.x/docs/api/net.html#net_class_net_socket
[Buffer]: https://nodejs.org/dist/latest-v4.x/docs/api/buffer.html#buffer_class_buffer
[dns.lookup()]: https://nodejs.org/dist/latest-v4.x/docs/api/dns.html#dns_dns_lookup_hostname_options_callback

