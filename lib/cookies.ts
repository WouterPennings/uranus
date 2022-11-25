import { setCookie, Cookie as ck } from "https://deno.land/std@0.159.0/http/cookie.ts";

export class Cookie {
    public name: string;
    public value: string;
    public expires?: Date;
    public maxAge?: number;
    public domain?: string;
    public path?: string;
    public secure?: boolean;
    public httpOnly?: boolean;

    constructor(name: string, value: string, expires?: Date, maxAge?: number, domain?: string, path?: string, secure?: boolean, httpOnly?: boolean) {
        this.name = name;
        this.value = value;
        this.expires = expires;
        this.maxAge = maxAge;
        this.domain = domain;
        this.path = path;
        this.secure = secure;
        this.httpOnly = httpOnly;
    }

    public toDenoCookie(): ck {
        const cookie: ck = {
            name: this.name,
            value: this.value,
            expires: this.expires,
            maxAge: this.maxAge,
            domain: this.domain,
            path: this.path,
            secure: this.secure,
            httpOnly: this.httpOnly,
        }

        return cookie;
    }
}

export class Cookies {
    private cookieCollection: Map<string, Cookie>;

    constructor(cookies: Cookie[] = []) {
        this.cookieCollection = new Map<string, Cookie>();
        for(let cookie of cookies) {
            this.cookieCollection.set(cookie.name, cookie);
        };
    }

    public static fromHeaders(header: Headers): Cookies {
        let cookiesHeader = header.get("cookie")?.split(';');
        if(cookiesHeader == undefined) {
            return new Cookies();
        }
    
        let cookies:Cookie[] = [];
    
        for(let c of cookiesHeader) {
            let parts= c.trim().split("=");
            const cookie: Cookie = new Cookie(parts[0], parts[1]);
            cookies.push(cookie);
        }
    
        return new Cookies(cookies);
    }

    public appendToHeaders(header: Headers) {
        for(let c of this.cookieCollection.values()) {
            setCookie(header, c);
        }
    }

    public keys(): string[] {
        let keys: string[] = [];
        this.cookieCollection.forEach((value, key) => {
            keys.push(key);
        });

        return keys;
    }

    public add(cookie: Cookie) {
        this.cookieCollection.set(cookie.name, cookie);
    }

    public get(cookie: Cookie): Cookie | undefined {
        return this.cookieCollection.get(cookie.name);
    }

    public contains(cookieName: string): boolean {
        return this.cookieCollection.has(cookieName);
    }

    public update(cookie: Cookie): boolean {
        if(this.cookieCollection.has(cookie.name) == false) {
            return false;
        } else {
            this.cookieCollection.set(cookie.name, cookie);
            return true;
        }
    }

    public remove(cookieName: string) {
        this.cookieCollection.delete(cookieName);
    }

    public removeAll() {
        this.cookieCollection.clear();
    }
}