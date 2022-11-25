import { serve, Server } from "https://deno.land/std@0.87.0/http/server.ts";
import {
    acceptable,
    acceptWebSocket,
    isWebSocketCloseEvent,
    WebSocket,
} from "https://deno.land/std@0.87.0/ws/mod.ts";

type OnMessageFunction = (message: string) => void;
type OnCloseFunction = () => void;

export class UranusWebSocket {
    public port: any;
    private onCloseHandler: OnCloseFunction = () => {
        console.log("Socket closed");
    };
    private onMessageHandler: OnMessageFunction = (str: string) => {
        console.log(str);
    };

    constructor(port: number) {
        this.port = port;
    }

    public start(callback = () => {}) {
        const server = serve({ port: this.port });
        this.serverServer(server);
        callback();
    }

    public onClose(handler: OnCloseFunction) {
        this.onCloseHandler = handler;
    }

    public onMessage(handler: OnMessageFunction) {
        this.onMessageHandler = handler;
    }

    private async serverServer(server: Server) {
        for await (const req of server) {
            const { conn, r: bufReader, w: bufWriter, headers } = req;

            acceptWebSocket({
                conn,
                bufReader,
                bufWriter,
                headers,
            }).then(this.handleWebSocket).catch(console.error);
        }
    }

    private async handleWebSocket(socket: WebSocket) {
        for await (const ev of socket) {
            // Socket is closed event
            if (isWebSocketCloseEvent(ev)) {
                console.log("Socket is closed");

                // FIXME: Undefined error... Do not know why
                // this.onCloseHandler();
            }

            // Just a regular message
            if (typeof ev === "string") {
                console.log("Message: " + ev);

                // FIXME: Undefined error... Do not know why
                // this.onMessageHandler(ev);
            }
        }
    }
}
