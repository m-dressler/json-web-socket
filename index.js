'use strict';

const JsonWebSocket = require('./client/JsonWebSocket.js');

JsonWebSocket.JsonWebSocket = require('./server/JsonWebSocketServer.js');

JsonWebSocket.WebSocket = WebSocket;
JsonWebSocket.WebSocketServer = WebSocket.Server;

module.exports = JsonWebSocket;
