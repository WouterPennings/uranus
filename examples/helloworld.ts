import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/{name}", (req, res) => {
    res.send(`<h1>Hello ${req.parameters.name}!</h1>`, {"content-type": "text/html"});
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
