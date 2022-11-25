import { endpointHandler } from "./uranusHTTP.ts";

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

    public isIdentical(url: string): [boolean, { [key: string]: string }] {
        let parts: string[] = url.split("/");
        parts = parts.filter((str) => str != "");

        if (parts.length != this.parts.length) {
            return [false, {}];
        }

        let parameters: { [key: string]: string } = {};

        for (let i = 0; i < parts.length; i++) {
            if (this.parts[i].type == URLPartType.Parameter) {
                parameters[this.parts[i].value] = parts[i];
            } else if (
                this.parts[i].type == URLPartType.Literal &&
                this.parts[i].value != parts[i]
            ) {
                return [false, {}];
            }
        }

        return [true, parameters];
    }

    private parseURL() {
        let parts: string[] = this.url.split("/");
        parts = parts.filter((str) => str != "");

        parts.forEach((part) => {
            if (part.indexOf("{") != -1 && part.indexOf("}") != -1) {
                this.parts.push(
                    new URLPart(
                        URLPartType.Parameter,
                        part.substring(
                            part.indexOf("{") + 1,
                            part.indexOf("}"),
                        ),
                    ),
                );
            } else {
                this.parts.push(new URLPart(URLPartType.Literal, part));
            }
        });
    }
}

export class URLCollection {
    private port: number;
    private URLs: [url: URL, handlers: endpointHandler[]][];
    private domain: string;

    constructor(port: number) {
        this.port = port;
        this.URLs = [];
        this.domain = "http://localhost:" + this.port;
    }

    public addURL(url: string, handlers: endpointHandler[]) {
        this.URLs.push([new URL(url), handlers]);
    }

    public getHandler(
        url: string,
    ): boolean | [endpointHandler[], { [key: string]: string }] {
        const path: string = url.substring(this.domain.length);

        for (let i = 0; i < this.URLs.length; i++) {
            const x = this.URLs[i][0].isIdentical(path);
            if (x[0]) {
                return [this.URLs[i][1], x[1]];
            }
        }

        return true;
    }

    public handlerExist(url: string): boolean {
        const path: string = url.substring(this.domain.length);
        for (let i = 0; i < this.URLs.length; i++) {
            const x = this.URLs[i][0].isIdentical(path);
            if (x[0]) {
                return true;
            }
        }

        return false;
    }
}