import { UranusHTTP } from "../lib/uranusHTTP.ts";
import { requestLogger } from "../lib/middelwares.ts";

// Port 3000 is the port that this webserver will be hosted on
const port = 3000;
// Creating a UranusHTTP instance
const app = new UranusHTTP(port);

// Using the middlewar that stores all the headers of all the request is a .log file
app.useMiddleware(requestLogger);

// Return text
app.get("/", (req, res) => {
    res.status(200).send("<h1>Hello, World!</h1>", { "Content-Type": "text/html" });
});

// Returning JSON with a POST request. Also getting parameter from URL
app.post("/json/{value}", (req, res) => {
    res.json({ "value": Number(req.parameters.value) });
});

// Return de body of the POST request
app.post("/body", (req, res) => {
    res.json(req.bodyToJSON());
});

// Using a DELETE request
app.delete("/person/{id}", (req, res) => {
    if(req.parameters.id == "123") {
        res.send("123");
    }
});

// You can also redirect to a different website
app.get("/redirect", (req, res) => {
    res.status(200).redirect("https://google.com");
});

app.get("/cookies", (req, res) => {
    res.cookies.add("ID", "123");
    res.send("There now is a cookie with the name: 'ID'");
});

// Starting the webserver with all the endpoints defined above
app.start(() => {
    console.log(`Listening on http://localhost:${port}`);
});
