export default JsonWebSocket = (wsUrl) => {
  const returnObject = {};

  const EVENT_LISTENERS = {};

  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    if (returnObject.onopen) returnObject.onopen();
  };
  ws.onclose = () => {
    if (returnObject.onclose) returnObject.onclose();
  };
  ws.onerror = () => {
    if (returnObject.onerror) returnObject.onerror();
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
