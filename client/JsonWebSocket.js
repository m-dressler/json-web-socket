// @ts-check

// @ts-ignore
const { WebSocket } = require("ws");

/**
 * @typedef {object} JsonWebSocket
 * @property { 0 | 1 | 2 | 3} readyState
 * @property {(() => any) | undefined} onclose
 * @property {(() => any) | undefined} onopen
 * @property {(event: string, listener: (data: any) => void)=>void} on
 * @property {(event: string, data: any)=>void} send
 * @property {(event: string, data: any)=>Promise<any>} sendSync
 * @property {(url:string)=>Promise<void>} connect
 */

/**
 * Creates a new WebSocket client
 *
 * @param {string|undefined} [url] The ws:// or wss:// URL to connect to the WebSocket
 * @param {object} [params]
 * @param {number} [params.reconnectTime]
 * @param {number} [params.connectTimeout]
 * @returns {JsonWebSocket}
 */
const JsonWebSocket = (url, params) => {
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

  /**
   * @param {string} url
   */
  result.connect = (url) => {
    // TODO handle already connected scenario
    ws = new WebSocket(url);
    result.readyState = WebSocket.CONNECTING;

    /** @type {number|undefined} */
    let timeoutId;
    // If we have a defined connection timeout, add a race condition
    if (params?.connectTimeout || 0 > 0) {
      timeoutId = setTimeout(() => {
        if (result.readyState === WebSocket.CONNECTING) ws.close();
      }, params?.connectTimeout);
    }

    ws.onopen = () => {
      result.readyState = WebSocket.OPEN;
      clearTimeout(timeoutId); // Clear the timeout as we connected
      if (result.onopen) result.onopen();
      resolveConnect(void 0);
    };
    ws.onclose = () => {
      result.readyState = WebSocket.CLOSED;
      if (result.onclose) result.onclose();

      const connectAfter = params?.reconnectTime;
      if (connectAfter !== undefined && connectAfter === 0) result.connect(url);
      else if (connectAfter !== undefined)
        setTimeout(() => result.connect(url), connectAfter);

      connectPromise = new Promise((res) => (resolveConnect = res));
    };
    ws.onmessage = (/** @type {{data:string}} */ message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event];
      if (listener) listener(data);
      else throw "NO WS EVENT LISTENER FOR" + event;
    };
    return connectPromise;
  };
  if (url !== undefined) result.connect(url);

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
    /** @type {(_:any)=>void} */
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
