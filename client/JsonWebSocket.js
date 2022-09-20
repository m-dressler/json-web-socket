// @ts-check

const { WebSocket } = require("ws");

/**
 * Creates a new WebSocket client
 *
 * @param {string} wsUrl The ws:// or wss:// URL to connect to the WebSocket
 */
const JsonWebSocket = (wsUrl) => {
  const result = {};
  /** @type {0|1|2|3} CONNECTING | CONNECTED | CLOSING | CLOSED */
  result.readyState = WebSocket.CONNECTING;
  /** @type {()=>void|undefined} */
  result.onclose = undefined;
  /** @type {()=>void|undefined} */
  result.onopen = undefined;

  const EVENT_LISTENERS = {};

  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    result.readyState = WebSocket.OPEN;
    if (result.onopen) result.onopen();
  };
  ws.onclose = () => {
    result.readyState = WebSocket.CLOSED;
    if (result.onclose) result.onclose();
  };
  ws.onmessage = (message) => {
    const { event, data } = JSON.parse(message.data);
    const listener = EVENT_LISTENERS[event];
    if (listener) listener(data);
    else throw "NO WS EVENT LISTENER FOR" + event;
  };

  result.on = (event, listener) => {
    if (listener) EVENT_LISTENERS[event] = listener;
    else delete EVENT_LISTENERS[event];
  };

  /**
   * Sends a JsonWebSocket message to the connection
   *
   * @param {string} event
   * @param {any} data
   */
  result.send = (event, data) => {
    ws.send(JSON.stringify({ event, data }));
  };

  /**
   * Sends a JsonWebSocket message to the connection and allows to await the response to the same message
   *
   * @param {string} event
   * @param {any} data
   * @returns {Promise<any>}
   */
  result.sendSync = async (event, data) => {
    const prevListener = EVENT_LISTENERS[event];
    let resolvePromise;
    const response = new Promise((resolve) => (resolvePromise = resolve));
    result.on(event, (data) => {
      resolvePromise(data);
    });
    ws.send(JSON.stringify({ event, data }));
    const resData = await response;
    result.on(event, prevListener);
    return resData;
  };

  return result;
};

module.exports = JsonWebSocket;
