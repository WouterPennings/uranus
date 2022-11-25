import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/{name}", async (req, res) => {
    res.text(`<h1>Hello ${req.parameters.name}!</h1>`);
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
