// @ts-check

/**
 * Creates a new WebSocket client
 *
 * @param {string|undefined} [url] The ws:// or wss:// URL to connect to the WebSocket
 * @param {object} [params]
 * @param {number} [params.reconnectTime]
 * @param {number} [params.connectTimeout]
 * @returns {import('../client/JsonWebSocket.js').JsonWebSocket}
 */
export const JsonWebSocket = (url, params) => {
  const result = {};
  /** @type {0|1|2|3} CONNECTING | CONNECTED | CLOSING | CLOSED */
  result.readyState = 0;
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
    ws = new WebSocket(url);
    result.readyState = 0;

    /** @type {number|undefined} */
    let timeoutId;
    // If we have a defined connection timeout, add a race condition
    if (params?.connectTimeout || 0 > 0) {
      timeoutId = setTimeout(() => {
        if (result.readyState === WebSocket.CONNECTING) ws.close();
      }, params?.connectTimeout);
    }

    ws.onopen = () => {
      result.readyState = 1;
      clearTimeout(timeoutId); // Clear the timeout as we connected
      if (result.onopen) result.onopen();
      resolveConnect(void 0);
    };
    ws.onclose = () => {
      result.readyState = 3;
      if (result.onclose) result.onclose();

      const connectAfter = params?.reconnectTime;
      if (connectAfter !== undefined && connectAfter === 0) result.connect(url);
      else if (connectAfter !== undefined)
        setTimeout(() => result.connect(url), connectAfter);

      connectPromise = new Promise((res) => (resolveConnect = res));
    };
    ws.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event];
      if (listener) listener(data);
      else console.error("NO WS EVENT LISTENER FOR", event);
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
    const prevListener = EVENT_LISTENERS[event];
    /** @type {(_:any)=>any} */
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

export default JsonWebSocket;
