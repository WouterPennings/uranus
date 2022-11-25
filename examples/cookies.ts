import { UranusHTTP, Cookie } from "../lib/uranusHTTP.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/cookies", async (req, res) => {
    const cookie: Cookie = {
        name: "ID",
        value: "123",
    }
    res.cookies.set("ID", cookie);
    res.text("There now is a cookie with the name: 'ID'");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
