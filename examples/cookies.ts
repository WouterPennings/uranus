import { UranusHTTP, Cookie } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", (req, res) => {
    const cookie: Cookie = new Cookie("ID1", "123");
    res.cookies.addCookie(cookie);
    res.send("There now is a cookie with the name: 'ID'");
});

app.get("/cookies", (req, res) => {
    res.cookies.add("new", "awdaw", { maxAge: 50 });
    res.send("There now is a cookie with the name: 'ID'");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
