/**
 * Creates a new WebSocket client
 *
 * @param {string} wsUrl The ws:// or wss:// URL to connect to the WebSocket
 * @param {object} [params]
 * @param {number} [params.reconnectTime]
 */
declare function JsonWebSocket(wsUrl: string, params?: {
    reconnectTime?: number;
}): {
    /** @type {0|1|2|3} CONNECTING | CONNECTED | CLOSING | CLOSED */
    readyState: 0 | 1 | 2 | 3;
    /** @type {()=>void|undefined} */
    onclose: () => void | undefined;
    /** @type {()=>void|undefined} */
    onopen: () => void | undefined;
    /**
     *
     * @param {string} event
     * @param {(data:any)=>void} listener
     */
    on(event: string, listener: (data: any) => void): void;
    /**
     * Sends a JsonWebSocket message to the connection
     *
     * @param {string} event
     * @param {any} data
     */
    send(event: string, data: any): void;
    /**
     * Sends a JsonWebSocket message to the connection and allows to await the response to the same message
     *
     * @param {string} event
     * @param {any} data
     * @returns {Promise<any>}
     */
    sendSync(event: string, data: any): Promise<any>;
};
