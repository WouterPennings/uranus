import { UranusHTTP } from "../lib/uranusHTTP.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", async (req, res) => {
    res.text("<h1>Hello, World!</h1>");
});

app.get("/file", async (req, res) => {
    res.sendFile("index.html");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
