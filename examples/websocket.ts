import { UranusWebSocket } from "../lib/uranusWS.ts";

const port = 8000;
const ws = new UranusWebSocket(port);

// FIMXE: Does nothing, since these handlers arent used because of weird undifined error
ws.onClose(() => {
    console.log("Websocket connection has been clossed");
});

// FIMXE: Does nothing, since these handlers arent used because of weird undifined error
ws.onMessage((str: string) => {
    console.log("Message from socket: " + str);
});

ws.start(() => {
    console.log("Websockets listening on " + port);
});
