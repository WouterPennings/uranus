import { UranusHTTP, Cookies, Cookie } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/cookies", async (req, res) => {
    const cookie: Cookie = new Cookie("ID", "123");
    res.cookies.add(cookie);
    res.text("There now is a cookie with the name: 'ID'");
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
