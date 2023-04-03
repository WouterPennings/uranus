import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", (req, res) => {
    res.send("<h1>Hello, World!</h1>");
});

app.get("/file", (req, res) => {
    res.sendFile("public/index.html");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
