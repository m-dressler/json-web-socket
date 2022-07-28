const JsonWebSocket = (wsUrl) => {
  const public = {};

  const EVENT_LISTENERS = {};

  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    if (public.onopen) public.onopen();
  };
  ws.onclose = () => {
    if (public.onclose) public.onclose();
  };
  ws.onerror = () => {
    if (public.onerror) public.onerror();
  };
  ws.onmessage = (message) => {
    const { event, data } = JSON.parse(message.data);
    const listener = EVENT_LISTENERS[event];
    if (listener) listener(data);
    else console.error("NO WS EVENT LISTENER FOR", event);
  };

  public.setEventListener = (event, listener) => {
    if (listener) EVENT_LISTENERS[event] = listener;
    else delete EVENT_LISTENERS[event];
  };

  public.send = (event, data) => {
    ws.send(JSON.stringify(event, data));
  };

  public.sendSync = async (event, data) => {
    const prevListener = EVENT_LISTENERS[event];
    let resolvePromise;
    const response = new Promise((resolve) => (resolvePromise = resolve));
    public.setEventListener(event, (data) => {
      resolvePromise(data);
    });
    ws.send(JSON.stringify({ event, data }));
    const resData = await response;
    public.setEventListener(prevListener);
    return resData;
  };

  return public;
};
