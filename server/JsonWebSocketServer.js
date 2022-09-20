// @ts-check

// @ts-ignore
const WebSocket = require("ws");

/**
 * @param {WebSocket.ServerOptions} [config]
 * @param {Object} [params]
 * @param {(params:{socket: WebSocket, request:import('http').IncomingMessage, send: (event:string, data:any)=>void, sendSync:(event:string, data:any)=>Promise<any>, session: any})=>void} [params.onconnect]
 * @param {()=>void} [params.onclose]
 */
const JsonWebSocketServer = (config, params) => {
  const webSocketServer = new WebSocket.Server(config);
  const GLOBAL_EVENT_LISTENERS = {};

  webSocketServer.on("connection", (socket, request) => {
    const EVENT_LISTENERS = {};
    const session = {};

    /**
     * @param {string} event
     * @param {(data:any)=>void|Promise<void>} listener
     */
    const on = (event, listener) => {
      if (listener) EVENT_LISTENERS[event] = listener;
      else delete EVENT_LISTENERS[event];
    };

    /**
     * @param {string} event
     * @param {any} data
     */
    const send = (event, data) => {
      socket.send(JSON.stringify({ event, data }));
    };

    /**
     * @param {string} event
     * @param {any} data
     * @returns {Promise<any>}
     */
    const sendSync = async (event, data) => {
      const prevListener = EVENT_LISTENERS[event];
      let resolvePromise;
      const response = new Promise((resolve) => (resolvePromise = resolve));
      on(event, (data) => {
        resolvePromise(data);
      });
      socket.send(JSON.stringify({ event, data }));
      const resData = await response;
      on(event, prevListener);
      return resData;
    };

    if (params?.onconnect)
      params.onconnect({ socket, request, send, sendSync, session });

    socket.onclose = params?.onclose;

    socket.onmessage = (/** @type {{data:string}} */ message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event] || GLOBAL_EVENT_LISTENERS[event];
      if (listener) listener(data, { send, sendSync, session, socket });
      else throw "NO WS EVENT LISTENER FOR " + event;
    };
  });

  /**
   * @param {string} event
   * @param {(data:any, {})=>void|Promise<void>} listener
   */
  const on = (event, listener) => {
    if (listener) GLOBAL_EVENT_LISTENERS[event] = listener;
    else delete GLOBAL_EVENT_LISTENERS[event];
  };

  /**
   * @param {Object.<string, (data:any, {})=>void|Promise<void>>} handlers
   */
  const onAll = (handlers) =>
    void Object.assign(GLOBAL_EVENT_LISTENERS, handlers);

  return { webSocketServer, on, onAll };
};

module.exports = JsonWebSocketServer;
