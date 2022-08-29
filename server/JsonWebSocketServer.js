const WebSocket = require("ws");

/**
 * @callback OnFunction
 * @param {string} event
 * @param {function(object):void|null} listener
 *
 * @callback SendFunction
 * @param {string} event
 * @param {object} data
 *
 * @callback SendSyncFunction
 * @param {string} event
 * @param {object} data
 * @returns {Promise<object>} The response for the same event
 */

/**
 *
 * @param {WebSocket.ServerOptions} config
 * @param {{onconnect:function({ socket:WebSocket.WebSocket, request:import('http').IncomingMessage, on:OnFunction, send:SendFunction, sendSync:SendSyncFunction, session }):void, onclose:function():void}} JsonWebSocketServerConfig
 * @returns {{webSocketServer: WebSocket.Server, on: OnFunction}}
 */
const JsonWebSocketServer = (config, { onconnect, onclose } = {}) => {
  const webSocketServer = new WebSocket.Server(config);
  const GLOBAL_EVENT_LISTENERS = {};

  webSocketServer.on("connection", async (socket, request) => {
    const EVENT_LISTENERS = {};
    const session = {};

    /** @type {OnFunction} */
    const on = (event, listener) => {
      if (listener) EVENT_LISTENERS[event] = listener;
      else delete EVENT_LISTENERS[event];
    };

    /** @type {SendFunction} */
    const send = (event, data) => {
      socket.send(JSON.stringify({ event, data }));
    };

    /** @type {SendSyncFunction} */
    const sendSync = async (event, data) => {
      const prevListener = EVENT_LISTENERS[event];
      let resolvePromise;
      const response = new Promise((resolve) => (resolvePromise = resolve));
      on(event, (data) => {
        resolvePromise(data);
      });
      socket.send(JSON.stringify({ event, data }));
      const resData = await response;
      on(prevListener);
      return resData;
    };

    if (onconnect) onconnect({ socket, request, on, send, sendSync, session });

    socket.onclose = onclose;

    socket.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event] || GLOBAL_EVENT_LISTENERS[event];
      if (listener) listener(data, { send, sendSync, session });
      else throw "NO WS EVENT LISTENER FOR " + event;
    };
  });

  /** @type {OnFunction} */
  const on = (event, listener) => {
    if (listener) GLOBAL_EVENT_LISTENERS[event] = listener;
    else delete GLOBAL_EVENT_LISTENERS[event];
  };

  return { webSocketServer, on };
};

module.exports = JsonWebSocketServer;
