import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", (req, res) => {
    res.send(`<h1>Hello, World!</h1>`);
});

app.delete("/person/{id}", (req, res) => {
    res.send(`Person with id: ${req.parameters.id} is now deleted.`);
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));