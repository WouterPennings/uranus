type endpointHandler = (request: UranusRequest, response: UranusResponse) => Promise<void>;

export class UranusHTTP {
    public port: Number;
    
    private listener: any;
    private reqEndPoints: Map<string, URLCollection>;

    constructor(port: any) {
        this.port = port;
        this.listener = Deno.listen({ port });

        this.reqEndPoints = new Map<string, URLCollection>([
            ["GET", new URLCollection(port)],
            ["POST", new URLCollection(port)],
            ["DELETE", new URLCollection(port)],
        ])
    }   

    public start(callback = () => {}) {
        this.serve();
        callback();
    }

    public get(path: string, handler: endpointHandler) {
        this.reqEndPoints.get("GET")?.addURL(path, handler);
    }

    public post(path: string, handler: endpointHandler) {
        this.reqEndPoints.get("POST")?.addURL(path, handler);
    }

    public delete(path: string, handler: endpointHandler) {
        this.reqEndPoints.get("DELETE")?.addURL(path, handler);
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
            if(reqEndPoints == undefined) {
                await request.respondWith(new Response("", {status: 404}));
                return;
            }

            let requestHandler = reqEndPoints.getHandler(request.request.url);
            if(typeof requestHandler != "boolean") {
                requestHandler = requestHandler as [endpointHandler, {[key: string]: string}];
                const handler = requestHandler[0];
                const parameters = requestHandler[1];
                let req = new UranusRequest(request.request, parameters);
                await req.init();
                await handler(req, new UranusResponse(request));
            } else {
                await request.respondWith(new Response("", {status: 404}));
            }
        }
    }
} 

class UranusRequest {
    private request: Request;

    public header: Headers;
    public method: string;
    public body: string;
    public url: string;
    public parameters: {[key: string]: string}
    
    constructor(request: Request, parameters: {[key: string]: string}) {
        this.request = request;

        this.header = request.headers;
        this.method = request.method;
        this.body = "NOT SUPPOSED TO SEE THIS";
        this.url = request.url;
        this.parameters = parameters;
    } 

    // TODO: This should probably happen in the constructor. 
    // But i am a noob with promises
    public async init() {
        let blob = await this.request.blob();
        this.body = await blob.text();
    }

    public bodyIsJSON(): boolean {
        try {
            JSON.parse(this.body);
            return true;
        } catch {
            return false;
        }
    }

    public bodyToJSON(): object {
        return JSON.parse(this.body);
    }
}

class UranusResponse {
    private request: Deno.RequestEvent;

    constructor(request: Deno.RequestEvent) {
        this.request = request;
    }

    public sendFile(path: string, status = 200) {
        const text = Deno.readFileSync(path)
        this.doResponse(new Response(text, { status }));
    } 

    public text(text: string, status = 200) {
        this.doResponse(new Response(text, { status }));
    } 

    public json(json: string | object, status = 200) {
        if(typeof json == "string") {
            this.doResponse(Response.json(JSON.parse(json as string), { status }));
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
        this.request.respondWith(response);
    }
}

enum URLPartType {
    Literal = "Literal",
    Parameter = "Parameter",
}

class URLPart {
    public type: URLPartType;
    public value: string;

    constructor(type: URLPartType, value: string) {
        this.type = type;
        this.value = value;
    }
}

class URL {
    public url: string;
    private parts: URLPart[];

    constructor(url: string) {
        this.url = url;
        this.parts = [];
        this.parseURL();
    }

    public isIdentical(url: string): [boolean, {[key: string]: string}] {
        let parts: string[] = url.split('/');
        parts = parts.filter(str => str != "");

        if(parts.length != this.parts.length) {
            return [false, {}];
        }

        let parameters: {[key: string]: string} = {}
        
        for(let i = 0; i < parts.length; i++) {
            if(this.parts[i].type == URLPartType.Parameter) {
                parameters[this.parts[i].value] =  parts[i];
            } else if(this.parts[i].type == URLPartType.Literal && this.parts[i].value != parts[i]) {
                return [false, {}];
            }
        }   
        
        return [true, parameters];
    }

    private parseURL() {
        let parts: string[] = this.url.split('/');
        parts = parts.filter(str => str != "");

        parts.forEach(part => {
            if(part.indexOf('{') != -1 && part.indexOf("}") != -1 ){
                this.parts.push(new URLPart(URLPartType.Parameter, part.substring(part.indexOf('{')+1, part.indexOf("}"))));
            } else {
                this.parts.push(new URLPart(URLPartType.Literal, part));
            }
        });
    }
}

class URLCollection {
    private port: number;
    private URLs: [url: URL, handler: endpointHandler][]
    private domain: string;

    constructor(port: number) {
        this.port = port;
        this.URLs = [];
        this.domain = "http://localhost:"+this.port;
    }

    public addURL(url: string, handler: endpointHandler) {
        this.URLs.push([new URL(url), handler]);
    }

    public getHandler(url: string): boolean | [endpointHandler, {[key: string]: string}] {
        const path: string = url.substring(this.domain.length);

        for (let i = 0; i < this.URLs.length; i++) {
            const x = this.URLs[i][0].isIdentical(path);
            if(x[0]) {
                return [this.URLs[i][1], x[1]];
            }
        }

        return true;
    }

    public handlerExist(url: string): boolean {
        const path: string = url.substring(this.domain.length);
        for (let i = 0; i < this.URLs.length; i++) {
            const x = this.URLs[i][0].isIdentical(path);
            if(x[0]) {
                return true;
            }
        }

        return false;
    }
}