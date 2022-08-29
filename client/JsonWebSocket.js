const { WebSocket } = require("ws");

/**
 * @typedef {Object} JsonWebSocket
 * @property {(0|1|2|3)} readyState CONNECTING | CONNECTED | CLOSING | CLOSED
 * @property {function():void} onopen
 * @property {function():void} onclose
 * @property {function(string, function(object):void):void} on Add an event listener to a JsonWebSocket event
 * @property {function(string, object):void} send Sends a JsonWebSocket message to the connection
 * @property {function(string, object):Promise<object>} sendSync Sends a JsonWebSocket message to the connection and allows to await the response to the same message
 */

/**
 *
 * @param {string} wsUrl The ws:// or wss:// URL to connect to the WebSocket
 * @returns {JsonWebSocket} The JsonWebSocket
 */
const JsonWebSocket = (wsUrl) => {
  const returnObject = {
    readyState: WebSocket.CONNECTING,
  };

  const EVENT_LISTENERS = {};

  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    returnObject.readyState = WebSocket.OPEN;
    if (returnObject.onopen) returnObject.onopen();
  };
  ws.onclose = () => {
    returnObject.readyState = WebSocket.CLOSED;
    if (returnObject.onclose) returnObject.onclose();
  };
  ws.onmessage = (message) => {
    const { event, data } = JSON.parse(message.data);
    const listener = EVENT_LISTENERS[event];
    if (listener) listener(data);
    else console.error("NO WS EVENT LISTENER FOR", event);
  };

  returnObject.on = (event, listener) => {
    if (listener) EVENT_LISTENERS[event] = listener;
    else delete EVENT_LISTENERS[event];
  };

  returnObject.send = (event, data) => {
    ws.send(JSON.stringify({ event, data }));
  };

  returnObject.sendSync = async (event, data) => {
    const prevListener = EVENT_LISTENERS[event];
    let resolvePromise;
    const response = new Promise((resolve) => (resolvePromise = resolve));
    returnObject.on(event, (data) => {
      resolvePromise(data);
    });
    ws.send(JSON.stringify({ event, data }));
    const resData = await response;
    returnObject.on(prevListener);
    return resData;
  };

  return returnObject;
};

module.exports = JsonWebSocket;
