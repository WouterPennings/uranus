import  { UranusHTTP, UranusRequest, UranusResponse } from "../lib/uranusHTTP.ts";

const mw = async (req: UranusRequest, res: UranusResponse): Promise<boolean> => {
  console.log(req.url);

  return false;
}

const port = 3000;
const app = new UranusHTTP(port);

app.useMiddleware(mw);

app.get("/", async (req, res) => {
  res.text("Yea regular text, I know...")
});

app.get("/file", async (req, res) => {
  res.sendFile("index.html");
});

app.post("/json/{value}", async (req, res) => {
  res.json({"value": Number(req.parameters.value)});
});

app.post("/body", async (req, res) => {
  res.text(`This was your body: ${req.body}\nI know kinda crazy`);
});

app.post("/bodytojson", async (req, res) => {
  res.json(req.bodyToJSON());
});

app.get('/redirect', async (req, res) => {
  res.redirect("https://google.com");
});

app.get('/end', async (req, res) => {
  res.end(404);
});

app.get('/person/{name}/blabla', async (req, res) => {
  console.log(req.parameters);
  res.text(req.parameters.name);
});

app.start(() => { console.log(`Listening on http://localhost:${port}`) });
