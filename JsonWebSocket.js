const JsonWebSocket = (wsUrl) => {
  const ws = new WebSocket(wsUrl);

  const EVENT_LISTENERS = {};

  ws.onmessage = (message) => {
    const { event, data } = JSON.parse(message.data);
    const listener = EVENT_LISTENERS[event];
    if (listener) listener(data);
    else console.error("NO WS EVENT LISTENER FOR", event);
  };

  const setEventListener = (event, listener) => {
    if (listener) EVENT_LISTENERS[event] = listener;
    else delete EVENT_LISTENERS[event];
  };

  const send = (event, data) => {
    ws.send(JSON.stringify(event, data));
  };

  const sendSync = async (event, data) => {
    const prevListener = EVENT_LISTENERS[event];
    let resolvePromise;
    const response = new Promise((resolve) => (resolvePromise = resolve));
    setEventListener(event, (data) => {
      resolvePromise(data);
    });
    ws.send(JSON.stringify({ event, data }));
    const resData = await response;
    setEventListener(prevListener);
    return resData;
  };

  return { setEventListener, send, sendSync };
};
