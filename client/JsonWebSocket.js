// @ts-check

// @ts-ignore
const { WebSocket } = require("ws");

/**
 * Creates a new WebSocket client
 *
 * @param {string} wsUrl The ws:// or wss:// URL to connect to the WebSocket
 * @param {object} [params]
 * @param {number} [params.reconnectTime]
 */
const JsonWebSocket = (wsUrl, params) => {
  const result = {};
  /** @type {0|1|2|3} CONNECTING | CONNECTED | CLOSING | CLOSED */
  result.readyState = WebSocket.CONNECTING;
  /** @type {(()=>any)|undefined} */
  result.onclose = undefined;
  /** @type {(()=>any)|undefined} */
  result.onopen = undefined;

  /** @type {Object.<string,(data:any)=>any>} */
  const EVENT_LISTENERS = {};

  /** @type {WebSocket} */
  let ws;
  /** @type {(value:any)=>void} */
  let resolveConnect;
  let connectPromise = new Promise((res) => (resolveConnect = res));

  const init = () => {
    ws = new WebSocket(wsUrl);
    result.readyState = WebSocket.CONNECTING;
    ws.onopen = () => {
      result.readyState = WebSocket.OPEN;
      if (result.onopen) result.onopen();
      resolveConnect();
    };
    ws.onclose = () => {
      result.readyState = WebSocket.CLOSED;
      if (result.onclose) result.onclose();

      const connectAfter = params.reconnectTime;
      if (connectAfter !== undefined && connectAfter === 0) init();
      else if (connectAfter !== undefined) setTimeout(init, connectAfter);

      connectPromise = new Promise((res) => (resolveConnect = res));
    };
    ws.onmessage = (/** @type {{data:string}} */ message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event];
      if (listener) listener(data);
      else throw "NO WS EVENT LISTENER FOR" + event;
    };
  };
  init();

  /**
   *
   * @param {string} event
   * @param {(data:any)=>void} listener
   */
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
    connectPromise.then(() => ws.send(JSON.stringify({ event, data })));
  };

  /**
   * Sends a JsonWebSocket message to the connection and allows to await the response to the same message
   *
   * @param {string} event
   * @param {any} data
   * @returns {Promise<any>}
   */
  result.sendSync = async (event, data) => {
    await connectPromise;
    ws.send(JSON.stringify({ event, data }));
    /** @type {(data:any)=>any} */
    const prevListener = EVENT_LISTENERS[event];
    let resolvePromise;
    const response = new Promise((resolve) => (resolvePromise = resolve));
    result.on(event, (data) => {
      resolvePromise(data);
    });
    const resData = await response;
    result.on(event, prevListener);
    return resData;
  };

  return result;
};

module.exports = JsonWebSocket;
