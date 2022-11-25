import { UranusHTTP, UranusRequest, UranusResponse } from "../mod.ts";
import { requestLogger } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

// Using the middlewar that stores all the headers of all the request is a .log file
app.useMiddleware(requestLogger);

export const testMiddleware1 = async (
    req: UranusRequest,
    res: UranusResponse,
) => {
    console.log(req.url);
}

export const testMiddleware2 = async (
    req: UranusRequest,
    res: UranusResponse,
) => {
    console.log(req.method);
}

app.get("/", async (req, res) => {
    res.text("Only using the universal middleware");
});

app.get("/specific", testMiddleware1, testMiddleware2, async (req, res) => {
    res.text("Also using two middlewares specifically added for this endpoint");
});

app.start(() => console.log(`Listening on http://localhost:${port}`) );