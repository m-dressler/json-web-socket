'use strict';

const JsonWebSocket = require('./client/JsonWebSocket.js');

JsonWebSocket.JsonWebSocket = JsonWebSocket;
JsonWebSocket.JsonWebSocketServer = require('./server/JsonWebSocketServer.js');

Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWebSocket = JsonWebSocket;
