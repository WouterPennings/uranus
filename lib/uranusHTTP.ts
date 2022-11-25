import { setCookie, type Cookie as ck } from "https://deno.land/std@0.159.0/http/cookie.ts";
import { URLCollection } from "./url.ts";

export type Cookie = ck;

export type endpointHandler = (
    request: UranusRequest,
    response: UranusResponse,
) => Promise<void>;

export class UranusHTTP {
    public port: Number;

    private listener: any;
    private reqEndPoints: Map<string, URLCollection>;
    private middlewares: endpointHandler[];

    constructor(port: any) {
        this.port = port;
        this.listener = Deno.listen({ port });

        this.reqEndPoints = new Map<string, URLCollection>([
            ["GET", new URLCollection(port)],
            ["POST", new URLCollection(port)],
            ["DELETE", new URLCollection(port)],
        ]);
        this.middlewares = [];
    }

    public start(callback = () => {}) {
        this.serve();
        callback();
    }

    public get(path: string, ...handler: endpointHandler[]) {
        this.reqEndPoints.get("GET")?.addURL(path, handler);
    }

    public post(path: string, ...handler: endpointHandler[]) {
        this.reqEndPoints.get("POST")?.addURL(path, handler);
    }

    public delete(path: string, ...handler: endpointHandler[]) {
        this.reqEndPoints.get("DELETE")?.addURL(path, handler);
    }

    public useMiddleware(mw: endpointHandler) {
        this.middlewares.push(mw);
    }

    private async serve() {
        for await (const conn of this.listener) {
            this.handleHTTPRequest(conn);
        }
    }

    private async handleHTTPRequest(conn: Deno.Conn) {
        const httpConn = Deno.serveHttp(conn);
        for await (const request of httpConn) {
            let reqEndPoints = this.reqEndPoints.get(request.request.method);
            if (reqEndPoints == undefined) {
                await request.respondWith(new Response("", { status: 404 }));
                return;
            }

            let requestHandler = reqEndPoints.getHandler(request.request.url);
            if (typeof requestHandler != "boolean") {
                requestHandler = requestHandler as [
                    endpointHandler[],
                    { [key: string]: string },
                ];
                const reqHandlers = requestHandler[0];
                const reqParameters = requestHandler[1];
                let req = new UranusRequest(request.request, reqParameters);
                await req.init();
                let res = new UranusResponse(request);
                for (let mw of this.middlewares) {
                    await mw(req, res);
                    if (res.hasBeenUsed) return;
                }

                for (let handler of reqHandlers) {
                    await handler(req, res);
                    if (res.hasBeenUsed) return;
                }
            } else {
                await request.respondWith(new Response("", { status: 404 }));
            }
        }
    }
}

export class UranusRequest {
    private request: Request;
    private bodyField: string;

    public readonly header: Headers;
    public readonly method: string;
    public readonly url: string;
    public readonly parameters: { [key: string]: string };
    public readonly cookies: Map<string, Cookie>;

    constructor(request: Request, parameters: { [key: string]: string }) {
        this.request = request;

        this.header = request.headers;
        this.method = request.method;
        this.bodyField = "NOT SUPPOSED TO SEE THIS";
        this.url = request.url;
        this.parameters = parameters;
        this.cookies = new Map<string, Cookie> ();

        let cookies = request.headers.get("cookie")?.split(';');
        if(cookies == undefined) {
            return;
        }
        for(let c of cookies) {
            let parts= c.trim().split("=");
            const cookie: Cookie = {
                name: parts[0],
                value: parts[1]
            }
            this.cookies.set(parts[0], cookie);
        }
    }

    // TODO: This should probably happen in the constructor.
    // But i am a noob with promises
    public async init() {
        let blob = await this.request.blob();
        this.bodyField = await blob.text();
    }

    public bodyIsJSON(): boolean {
        try {
            JSON.parse(this.bodyField);
            return true;
        } catch {
            return false;
        }
    }

    public body() {
        return this.bodyField;
    }

    public bodyToJSON(): object {
        return JSON.parse(this.bodyField);
    }
}

export class UranusResponse {
    private request: Deno.RequestEvent;
    public hasBeenUsed: boolean;
    public cookies: Map<string, Cookie>;

    constructor(request: Deno.RequestEvent) {
        this.request = request;
        this.hasBeenUsed = false;
        this.cookies = new Map<string, Cookie> ();

        let cookies = request.request.headers.get("cookie")?.split(';');
        if(cookies == undefined) {
            return;
        }
        for(let c of cookies) {
            let parts= c.trim().split("=");
            const cookie: Cookie = {
                name: parts[0],
                value: parts[1]
            }
            this.cookies.set(parts[0], cookie);
        }
    }

    public sendFile(path: string, status = 200) {
        const text = Deno.readFileSync(path);
        this.doResponse(new Response(text, { status }));
    }

    public text(text: string, status = 200) {
        this.doResponse(new Response(text, { status }));
    }

    public json(json: string | object, status = 200) {
        if (typeof json == "string") {
            this.doResponse(
                Response.json(JSON.parse(json as string), { status }),
            );
        } else {
            this.doResponse(Response.json(json, { status }));
        }
    }

    public redirect(text: string, status = 302) {
        this.doResponse(Response.redirect(text, status));
    }

    public end(status: number) {
        this.doResponse(new Response("", { status }));
    }

    private doResponse(response: Response) {   
        for(let c of this.cookies) {
            setCookie(response.headers, c[1]);
        }
        // response.headers.set("content-type", "text/html; charset=utf-8");
        if (!this.hasBeenUsed) {
            this.request.respondWith(response);
            this.hasBeenUsed = true;
        }
    }
}
