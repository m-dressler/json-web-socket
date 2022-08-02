import { WebSocketServer } from "ws";

export default JsonWebSocketServer = (config, { onconnect, onclose }={}) => {
  const webSocketServer = new WebSocketServer(config);
  const GLOBAL_EVENT_LISTENERS = {};

  webSocketServer.on("connection", async (socket, request) => {
    const EVENT_LISTENERS = {};

    const on = (event, listener) => {
      if (listener) EVENT_LISTENERS[event] = listener;
      else delete EVENT_LISTENERS[event];
    };

    const send = (event, data) => {
      socket.send(JSON.stringify({ event, data }));
    };

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

    if (onconnect) onconnect({ socket, request, on, send, sendSync });

    socket.onclose = onclose;

    socket.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event] || GLOBAL_EVENT_LISTENERS[event];
      if (listener) listener(data, { send, sendSync });
      else throw "NO WS EVENT LISTENER FOR " + event;
    };
  });

  const on = (event, listener) => {
    if (listener) GLOBAL_EVENT_LISTENERS[event] = listener;
    else delete GLOBAL_EVENT_LISTENERS[event];
  };

  return { webSocketServer, on };
};
