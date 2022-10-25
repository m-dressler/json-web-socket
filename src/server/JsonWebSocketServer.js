// @ts-check

// @ts-ignore
const WebSocket = require("ws");

// @ts-ignore
/** @typedef {import('http').IncomingMessage} IncomingMessage */
/**
 * @typedef {Object} WebSocketParams
 * @property {(event:string, data:any)=>void} send Sends data via the WebSocket to the client
 * @property {(event:string, data:any)=>Promise<any>} sendSync Sends data via the WebSocket to the client and awaits the same event response
 * @property {any} session The contextual data of the WebSocket's session
 * @property {WebSocket} socket The socket for the underlying connection
 */

/**
 * @param {WebSocket.ServerOptions} [config]
 * @param {Object} [params]
 * @param {(params:{socket: WebSocket, request:IncomingMessage, send: (event:string, data:any)=>void, sendSync:(event:string, data:any)=>Promise<any>, session: any})=>void} [params.onconnect]
 * @param {()=>void} [params.onclose]
 */
const JsonWebSocketServer = (config, params) => {
  const webSocketServer = new WebSocket.Server(config);
  /** @type {Object.<string, (data:any, params?: WebSocketParams)=>void|Promise<void>>} */
  const GLOBAL_EVENT_LISTENERS = {};

  webSocketServer.on(
    "connection",
    /**
     * @param {WebSocket} socket
     * @param {IncomingMessage} request
     */
    (socket, request) => {
      /** @type {Object.<string, (data:any, params?: WebSocketParams)=>void|Promise<void>>} */
      const EVENT_LISTENERS = {};
      const session = {};

      /**
       * @param {string} event
       * @param {(data:any, params?: WebSocketParams)=>void|Promise<void>} listener
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
        /** @type {(_:any)=>void} */
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
        const listener =
          EVENT_LISTENERS[event] || GLOBAL_EVENT_LISTENERS[event];
        if (listener) listener(data, { send, sendSync, session, socket });
        else console.error(`NO WS EVENT LISTENER FOR "${event}"`);
      };
    }
  );

  /**
   * @param {string} event
   * @param {(data:any, params?:WebSocketParams)=>void|Promise<void>} listener
   */
  const on = (event, listener) => {
    if (listener) GLOBAL_EVENT_LISTENERS[event] = listener;
    else delete GLOBAL_EVENT_LISTENERS[event];
  };

  /**
   * @param {Object.<string, (data:any, params?:WebSocketParams)=>void|Promise<void>>} handlers
   */
  const onAll = (handlers) =>
    void Object.assign(GLOBAL_EVENT_LISTENERS, handlers);

  return { webSocketServer, on, onAll };
};

module.exports = JsonWebSocketServer;
