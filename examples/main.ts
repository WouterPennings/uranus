import  { Uranus, Res as Response, URL } from "../uranus.ts";

let url = new URL("/person/{id}");
let [isIdentical, parameters] = url.isIdentical("/person/1234")
console.log(isIdentical);
console.log(parameters);

// const port = 3000;
// const app = new Uranus(port);

// app.get("/", async(req) => {
//   return Response.text("Yea regular text, I know...")
// });

// app.get("/file", async (req) => {
//   return Response.sendFile("index.html");
// });

// app.get("/json", async (req) => {
//   return Response.json({"value": 13});
// });

// app.post("/json", async (req) => {
//   return Response.text('"value": 13}');
// });

// app.post("/body", async (req) => {
//   return Response.text(`This was your body: ${req.body}\nI know kinda crazy`);
// });

// app.post("/bodytojson", async (req) => {
//   return Response.json(req.bodyToJSON());
// });

// app.get('/redirect', async (req) => {
//   return Response.redirect("https://google.com");
// });

// app.get('/end', async (req) => {
//   return Response.end(404);
// });

// app.get('/person/{name}', async (req) => {
//   req.parameters.name
//   return Response.end(404);
// });

// app.start(() => { console.log(`Listening on ${port}`) });
