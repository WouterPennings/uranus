# Uranus 🪐 Web Framework

A web framework written in TypeScript for the Deno Runtime. Inspired by
[Flask](https://flask.palletsprojects.com/en/2.2.x/),
[Express.js](https://expressjs.com/) and
[ASP.net](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-7.0).
Uranus is a minimal and unopinionated web framework for the Deno runtime.

```typescript
import { UranusHTTP } from "../mod.ts";

const port = 3000;
const app = new UranusHTTP(port);

app.get("/{name}", async (req, res) => {
    res.html(`<h1>Hello ${req.parameters.name}!</h1>`);
});

app.start(() => console.log(`Listening on: http://localhost:${port}`));
```

## Features

- **HTTP Methods**: GET, POST, DELETE, PUT and PATH
  - More are being implemented.
- **Body and Header**: Every endpoint has access to the header and body of a
  HTTP request
- **URL Parameters**: getting values out of the URL
- **Middlewares**: Universal middlewares executed for all endpoints, and middlewares specified per endpoint.
- **Response Types**: Multiple ways of responding to a request, think of files,
  JSON or redirecting.
- **Cookie Support**: Using cookies without touching the HTTP header.
- **Serving Static files**: Serve static file like `.html` with one function call.

## Roadmap

What features are on the list to be implemented:

- **Support for Files:** Support for file uploads in requests. And files in the response (I.E. *pdf, *.md).
  - No need to install dependencies.
- **Built-in Websockets:** Built-in support for a websockets server.

## Usage

To run an example:

1. `deno run --allow-net --allow-read --allow-write helloworld.ts`

To import the library:

1. Copy the `uranusHTTP.ts` file to your working directory.
2. Past this: `import { UranusHTTP } from "./uranusHTTP.ts";` in your `*.ts`
   file.

### Permissions

Currently Uranus 🪐 only uses these Deno permissions:
- `--allow-net`
- `--allow-read `
- `--allow-write`

`--allow-net` is the only permission it will always needs.