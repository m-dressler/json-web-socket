export = JsonWebSocketServer;
/** @typedef {import('http').IncomingMessage} IncomingMessage */
/**
 * @param {WebSocket.ServerOptions} [config]
 * @param {Object} [params]
 * @param {(params:{socket: WebSocket, request:IncomingMessage, send: (event:string, data:any)=>void, sendSync:(event:string, data:any)=>Promise<any>, session: any})=>void} [params.onconnect]
 * @param {()=>void} [params.onclose]
 */
declare function JsonWebSocketServer(config?: WebSocket.ServerOptions, params?: {
    onconnect?: (params: {
        socket: WebSocket;
        request: any;
        send: (event: string, data: any) => void;
        sendSync: (event: string, data: any) => Promise<any>;
        session: any;
    }) => void;
    onclose?: () => void;
}): {
    webSocketServer: any;
    on: (event: string, listener: (data: any, {}: {}) => void | Promise<void>) => void;
    onAll: (handlers: {
        [x: string]: (data: any, {}: {}) => void | Promise<void>;
    }) => any;
};
declare namespace JsonWebSocketServer {
    export { IncomingMessage };
}
type IncomingMessage = any;
