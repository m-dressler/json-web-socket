import { WebSocketServer } from "ws";

const JsonWebSocketServer = ({ config }, { onconnect, onclose }) => {
  const webSocketServer = new WebSocketServer({ server });
  const GLOBAL_EVENT_LISTENERS = {};

  webSocketServer.on("connection", async (socket, request) => {
    const EVENT_LISTENERS = {};

    const setEventListener = (event, listener) => {
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
      setEventListener(event, (data) => {
        resolvePromise(data);
      });
      socket.send(JSON.stringify({ event, data }));
      const resData = await response;
      setEventListener(prevListener);
      return resData;
    };

    if (onconnect)
      onconnect({ socket, request, setEventListener, send, sendSync });

    socket.onclose = onclose;

    socket.onmessage = (message) => {
      const { event, data } = JSON.parse(message.data);
      const listener = EVENT_LISTENERS[event] || GLOBAL_EVENT_LISTENERS[event];
      if (listener) listener(data, { send, sendSync });
      else throw "NO WS EVENT LISTENER FOR " + event;
    };
  });

  const setEventListener = (event, listener) => {
    if (listener) GLOBAL_EVENT_LISTENERS[event] = listener;
    else delete GLOBAL_EVENT_LISTENERS[event];
  };

  return { webSocketServer, setEventListener };
};
