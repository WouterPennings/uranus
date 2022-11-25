import { UranusHTTP } from "../lib/uranusHTTP.ts";
import { requestLogger } from "../lib/middelwares.ts";

// Port 3000 is the port that this webserver will be hosted on
const port = 3000;
// Creating a UranusHTTP instance
const app = new UranusHTTP(port);

// Using the middlewar that stores all the headers of all the request is a .log file
app.useMiddleware(requestLogger);

// Return text
app.get("/", async (req, res) => {
  res.text("Yea regular text, I know...")
});

// Can also return the content of a file
app.get("/file", async (req, res) => {
  res.sendFile("index.html");
});

// Returning JSON with a POST request. Also getting parameter from URL
app.post("/json/{value}", async (req, res) => {
  res.json( { "value": Number(req.parameters.value) } );
});

// Return de body of the POST request
app.post("/body", async (req, res) => {
  res.json(req.bodyToJSON());
});

// Using a DELETE request
app.delete('/person/{id}', async (req, res) => {
  res.text(`Deleted person with id: ${req.parameters.id}`)
});

// You can also redirect to a different website
app.get('/redirect', async (req, res) => {
  res.redirect("https://google.com");
});


// Starting the webserver with all the endpoints defined above
app.start(() => { console.log(`Listening on http://localhost:${port}`) });
