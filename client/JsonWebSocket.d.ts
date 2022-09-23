export = JsonWebSocket;
/**
 * @typedef {object} JsonWebSocket
 * @property { 0 | 1 | 2 | 3} readyState
 * @property {(() => any) | undefined} onclose
 * @property {(() => any) | undefined} onopen
 * @property {(event: string, listener: (data: any) => void)=>void} on
 * @property {(event: string, data: any)=>void} send
 * @property {(event: string, data: any)=>Promise<any>} sendSync
 * @property {(url:string)=>Promise<void>} connect
 */
/**
 * Creates a new WebSocket client
 *
 * @param {string} [url] The ws:// or wss:// URL to connect to the WebSocket
 * @param {object} [params]
 * @param {number} [params.reconnectTime]
 * @returns {JsonWebSocket}
 */
declare function JsonWebSocket(url?: string | undefined, params?: {
    reconnectTime?: number | undefined;
} | undefined): JsonWebSocket;
declare namespace JsonWebSocket {
    export { JsonWebSocket };
}
type JsonWebSocket = {
    readyState: 0 | 1 | 2 | 3;
    onclose: (() => any) | undefined;
    onopen: (() => any) | undefined;
    on: (event: string, listener: (data: any) => void) => void;
    send: (event: string, data: any) => void;
    sendSync: (event: string, data: any) => Promise<any>;
    connect: (url: string) => Promise<void>;
};
