type Listener = (data: any) => void;

export interface JsonWebSocket {
  on(event: string, listener: Listener): void;
  send(event: string, data: any): void;
  sendSync(event: string, data: any): Promise<any>;
}
