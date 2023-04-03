import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.serveStaticFiles("public/");

app.get("/", async (req, res) => {
    res.send("Hello, static files example")
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));