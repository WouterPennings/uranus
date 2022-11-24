import  { Uranus, Res as Response } from "../uranus.ts";

const port = 3000;
const app = new Uranus(port);

app.get("/", async(req) => {
  return Response.text("Yea regular text, I know...")
});

app.get("/file", async (req) => {
  return Response.sendFile("index.html");
});

app.post("/json/{value}", async (req) => {
  return Response.json({"value": Number(req.parameters.value)});
});

app.post("/body", async (req) => {
  return Response.text(`This was your body: ${req.body}\nI know kinda crazy`);
});

app.post("/bodytojson", async (req) => {
  return Response.json(req.bodyToJSON());
});

app.get('/redirect', async (req) => {
  return Response.redirect("https://google.com");
});

app.get('/end', async (req) => {
  return Response.end(404);
});

app.get('/person/{name}/blabla', async (req) => {
  console.log(req.parameters);
  return Response.text(req.parameters.name);
});

app.start(() => { console.log(`Listening on ${port}`) });
