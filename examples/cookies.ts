import { UranusHTTP, Cookie } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/", async (req, res) => {
    const cookie: Cookie = new Cookie("ID1", "123");
    res.cookies.addCookie(cookie);
    res.text("There now is a cookie with the name: 'ID'");
});

app.get("/cookies", async (req, res) => {
    res.cookies.add("new", "awdaw", { maxAge: 50 });
    res.text("There now is a cookie with the name: 'ID'");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
