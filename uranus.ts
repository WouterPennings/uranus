export class Uranus {
    private port: Number;
    private listener: any;
    private getReqEndPointsTwo: {[key: string]: (request: Req) => Promise<Response>}
    private postReqEndPointsTwo: {[key: string]: (request: Req) => Promise<Response>}

    constructor(port: any) {
        this.port = port;
        this.listener = Deno.listen({ port });
        this.getReqEndPointsTwo = {};
        this.postReqEndPointsTwo = {};
    }

    public start(callback = () => {}) {
        this.serve();
        callback();
    }

    public get(path: string, handler: (request: Req) => Promise<Response>) {
        this.getReqEndPointsTwo[`http://localhost:${this.port}${path}`] = handler;
    }

    public post(path: string, handler: (request: Req) => Promise<Response>) {
        this.postReqEndPointsTwo[`http://localhost:${this.port}${path}`] = handler;
    }

    private async serve() {
        for await (const conn of this.listener) {
            this.handleHTTPRequest(conn);
        }
    }

    private async handleHTTPRequest(conn: Deno.Conn) {
        const httpConn = Deno.serveHttp(conn);
        for await (const request of httpConn) {
            switch(request.request.method) {
                case "GET": 
                    this.handleGETHTTPRequest(request);
                    break; 
                case "POST": 
                    this.handlePOSTHTTPRequest(request);
                    break;
                default: 
                    await request.respondWith(new Response("", {status: 400}));
                    break;
            }
        }
    }

    private async handleGETHTTPRequest(request: Deno.RequestEvent) {
        const requestHandler = this.getReqEndPointsTwo[request.request.url];
        if(requestHandler != undefined) {
            let req = new Req(request.request);
            await req.init();
            await request.respondWith(await requestHandler(req));
        } else {
            await request.respondWith(new Response("", {status: 400}));
        }
    }

    private async handlePOSTHTTPRequest(request: Deno.RequestEvent) {
        const requestHandler = this.postReqEndPointsTwo[request.request.url];
        if(requestHandler != undefined) {
            let req = new Req(request.request);
            await req.init();
            await request.respondWith(await requestHandler(req));
        } else {
            await request.respondWith(new Response("", {status: 400}));
        }
    }
} 

export class Req {
    private request: Request;

    public header: Headers;
    public method: string;
    public body: string;
    public url: string;
    public parameters: {[key: string]: string}
    
    constructor(request: Request) {
        this.request = request;

        this.header = request.headers;
        this.method = request.method;
        this.body = "NOT SUPPOSED TO SEE THIS";
        this.url = request.url;
        this.parameters = {};
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

export class Res {
    public static sendFile(path: string, status = 200): Response {
        const text = Deno.readFileSync(path)
        return new Response(text, { status });
    } 

    public static text(text: string, status = 200): Response {
        return new Response(text, { status });
    } 

    public static json(json: string | object, status = 200): Response {
        if(typeof json == "string") {
            return Response.json(JSON.parse(json as string), { status });
        } else {
            return Response.json(json, { status });
        }
    } 

    public static redirect(text: string, status = 302): Response {
        return Response.redirect(text, status);
    }

    public static end(status: number): Response {
        return new Response("", { status })
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

export class URL {
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

        console.log(this.parts);
    }
}