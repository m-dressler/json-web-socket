export = JsonWebSocketServer;
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
declare function JsonWebSocketServer(config?: any, params?: {
    onconnect?: ((params: {
        socket: WebSocket;
        request: any;
        send: (event: string, data: any) => void;
        sendSync: (event: string, data: any) => Promise<any>;
        session: any;
    }) => void) | undefined;
    onclose?: (() => void) | undefined;
} | undefined): {
    webSocketServer: any;
    on: (event: string, listener: (data: any, params?: WebSocketParams) => void | Promise<void>) => void;
    onAll: (handlers: {
        [x: string]: (data: any, params?: WebSocketParams) => void | Promise<void>;
    }) => undefined;
};
declare namespace JsonWebSocketServer {
    export { IncomingMessage, WebSocketParams };
}
type IncomingMessage = any;
type WebSocketParams = {
    /**
     * Sends data via the WebSocket to the client
     */
    send: (event: string, data: any) => void;
    /**
     * Sends data via the WebSocket to the client and awaits the same event response
     */
    sendSync: (event: string, data: any) => Promise<any>;
    /**
     * The contextual data of the WebSocket's session
     */
    session: any;
    /**
     * The socket for the underlying connection
     */
    socket: WebSocket;
};
