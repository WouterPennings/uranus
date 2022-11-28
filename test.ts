import { UranusHTTP } from "./lib/uranusHTTP.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.serveStaticFiles("examples/");

app.get("/", async (req, res) => {
    res.sendFile("examples/index.html");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
