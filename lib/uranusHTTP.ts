import { DenoStdInternalError } from "https://deno.land/std@0.159.0/_util/assert.ts";
import { Cookies, Cookie } from "./cookies.ts";
import { URLCollection } from "./url.ts";

const fileExtentionContentType: Map<string, string> = new Map<string, string>([
    ["html" || "txt", "text/html"],
    ["css", "text/css"],
    ["js", "text/javascript"],
    ["pdf", "application/pdf"], 
    ["jpg", "image/jpg"],
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["gif", "image/gif"],
    ["svg", "image/svg"],
]);

export type endpointHandler = (
    request: UranusRequest,
    response: UranusResponse,
) => Promise<void> | void;

export class UranusHTTP {
    public port: Number;

    private listener: any;
    private reqEndPoints: Map<string, URLCollection>;
    private middlewares: endpointHandler[];
    private staticFilesDirectory: string | undefined;

    constructor(port: any) {
        this.port = port;
        this.listener = Deno.listen({ port });
        // TODO: HEAD, OPTION, TRACE
        this.reqEndPoints = new Map<string, URLCollection>([
            ["GET", new URLCollection(port)],
            ["POST", new URLCollection(port)],
            ["DELETE", new URLCollection(port)],
            ["PUT", new URLCollection(port)],
            ["PATCH", new URLCollection(port)],
        ]);
        this.middlewares = [];
        this.staticFilesDirectory = undefined;
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

    public put(path: string, ...handler: endpointHandler[]) {
        this.reqEndPoints.get("PUT")?.addURL(path, handler);
    }

    public patch(path: string, ...handler: endpointHandler[]) {
        this.reqEndPoints.get("PATCH")?.addURL(path, handler);
    }

    public useMiddleware(mw: endpointHandler) {
        this.middlewares.push(mw);
    }

    public serveStaticFiles(directory: string): boolean {
        // Checks if directory exists ...
        if(this.pathExists(directory)) {
            this.staticFilesDirectory = directory;
            return true;
        } else {
            return false;
        }
    }

    private async serve() {
        for await (const conn of this.listener) {
            this.handleHTTPRequest(conn);
        }
    }

    private async handleHTTPRequest(conn: Deno.Conn) {
        const httpConn = Deno.serveHttp(conn);
        for await (const request of httpConn) {
            // Checks if HTTP methods is suported.
            // If not, a 404 will be returned.
            let reqEndPoints = this.reqEndPoints.get(request.request.method);
            if (reqEndPoints == undefined) {
                await request.respondWith(new Response("", { status: 404 }));
                return;
            }
            
            // Sending a static file IF enabled AND file exists ...
            // IF static file exists, the file gets send.
            if(this.staticFilesDirectory != undefined) {
                const path = this.getPathFromURL(request.request.url);

                // A '..' in a path, means that they users are trying to get out of the static files folder
                // This is a security risks, therefore the check.
                if(path.includes("..")) {
                    console.warn(`WARNING: User is trying to get out of the '${this.serveStaticFiles}' folder. Blocker request.`)
                }

                if(this.fileExists(this.staticFilesDirectory + path)) {
                    let res = new UranusResponse(request);
                    res.sendFile(this.staticFilesDirectory + path);
                    return;
                }
            }

            // Handles the request
            // First the middlewares, than the endpoint.
            let requestHandler = reqEndPoints.getHandler(request.request.url);
            if (typeof requestHandler != "boolean") {
                requestHandler = requestHandler as [
                    endpointHandler[],
                    { [key: string]: string },
                ];
                let req = new UranusRequest(request.request, requestHandler[1], conn.remoteAddr);
                let res = new UranusResponse(request);
                await req.init();
            
                for (let mw of this.middlewares) {
                    await mw(req, res);
                    if (res.hasBeenUsed()) return;
                }

                for (let handler of requestHandler[0]) {
                    await handler(req, res);
                    if (res.hasBeenUsed()) return;
                }
            } else {
                await request.respondWith(new Response("", { status: 404 }));
            }
        }
    }
    
    private getPathFromURL(URL: string): string {
        const domain = "http://localhost:" + this.port;
        const path = URL.substring(domain.length);

        return path;
    }

    private fileExists(path: string): boolean {
        try {
            const _ = Deno.readFileSync(path);
            return true;
        } catch(e) {
            return false;
        }
    }

    private pathExists(path: string): boolean {
        try {
            const _ = Deno.stat(path);
            console.log(path);
            return true;
        } catch(e) {
            return false;
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
    public readonly cookies: Cookies;
    public readonly remoteAddr: Deno.Addr; 
    /**
     *  **UNSAFE**
     * 
     * This field is empty by default. A field for I.E. middlewares to add data to, think of things, like sessions. 
     * 
     * This field however it not type-safe, or in-general safe, since every middleware can mutate this data.
     */
    public unsafeData: {[key: string]: any};

    constructor(request: Request, parameters: { [key: string]: string }, remoteAddr: Deno.Addr) {
        this.request = request;

        this.header = request.headers;
        this.method = request.method;
        this.bodyField = "NOT SUPPOSED TO SEE THIS";
        this.url = request.url;
        this.parameters = parameters;
        this.cookies = new Cookies();
        this.remoteAddr = remoteAddr;
        this.unsafeData = {};

        let cookies = request.headers.get("cookie")?.split(';');
        if(cookies == undefined) {
            return;
        }
        for(let c of cookies) {
            let parts= c.trim().split("=");
            const cookie: Cookie = new Cookie(parts[0], parts[1]);
            this.cookies.add(cookie);
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
    private _hasBeenUsed: boolean;
    private _text: string;
    private customHeaders: [string, string][];
    public cookies: Cookies;

    constructor(request: Deno.RequestEvent) {
        this.request = request;
        this._hasBeenUsed = false;
        this.cookies = new Cookies();
        this._text = "";
        this.customHeaders = [];

        let cookies = request.request.headers.get("cookie")?.split(';');
        if(cookies == undefined) {
            return;
        }
        for(let c of cookies) {
            let parts= c.trim().split("=");
            const cookie: Cookie = new Cookie(parts[0], parts[1]);
            this.cookies.add(cookie);
        }
    }

    public hasBeenUsed() {
        return this._hasBeenUsed;
    }

    public sendFile(path: string, status = 200) {
        const text = Deno.readFileSync(path);
        this.setHeader('Content-Type', this.getContentTypeHeader(path));
        this.doResponse(new Response(text, { status }));
    }

    public text(text: string, status = 200) {
        this._text += text;
        this.doResponse(new Response(this._text, { status }));
    }

    public write(text: string) {
        this._text += text;
    }

    public setHeader(key: string, value: string) {
        this.customHeaders.push([key, value]);
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
        this.cookies.appendToHeaders(response.headers);
        for(let header of this.customHeaders) {
            response.headers.append(header[0], header[1]);
        }
        // response.headers.set("content-type", "text/html; charset=utf-8");
        if (!this._hasBeenUsed) {
            this.request.respondWith(response);
            this._hasBeenUsed = true;
        }
    }

    private getContentTypeHeader(filepath: string): string {
        const parts = filepath.split('.');
        const x = fileExtentionContentType.get(parts[parts.length - 1]);
        if(x == undefined) {
            return "text/html";
        } else {
            return x;
        }
    }
}
