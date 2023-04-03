import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", async (req, res) => {
    res.send(`<h1>Hello, World!</h1>`);
});

app.post("/post", async (req, res) => {
    res.send(req.body());
});

app.post("/postjson", async (req, res) => {
    res.json(req.bodyToJSON());
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
