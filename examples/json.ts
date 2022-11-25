import { UranusHTTP } from "../lib/uranusHTTP.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/{number}", async (req, res) => {
    res.json({ "number": req.parameters.number });
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
