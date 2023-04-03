import {
    Cookie as ck,
    setCookie,
} from "https://deno.land/std@0.159.0/http/cookie.ts";

interface ICookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
}

export class Cookie {
    public name: string;
    public value: string;
    public options?: ICookieOptions;

    constructor(
        name: string,
        value: string,
        options?: ICookieOptions,
    ) {
        this.name = name;
        this.value = value;
        this.options = options;
    }

    public toDenoCookie(): ck {
        const cookie: ck = {
            name: this.name,
            value: this.value,
            expires: this.options?.expires,
            maxAge: this.options?.maxAge,
            domain: this.options?.domain,
            path: this.options?.path,
            secure: this.options?.secure,
            httpOnly: this.options?.httpOnly,
        };

        return cookie;
    }
}

export class Cookies {
    private cookieCollection: Map<string, Cookie>;

    constructor(cookies: Cookie[] = []) {
        this.cookieCollection = new Map<string, Cookie>();
        for (let cookie of cookies) {
            this.cookieCollection.set(cookie.name, cookie);
        }
    }

    public static fromHeaders(header: Headers): Cookies {
        let cookiesHeader = header.get("cookie")?.split(";");
        if (cookiesHeader == undefined) {
            return new Cookies();
        }

        let cookies: Cookie[] = [];

        for (let c of cookiesHeader) {
            let parts = c.trim().split("=");
            const cookie: Cookie = new Cookie(parts[0], parts[1]);
            cookies.push(cookie);
        }

        return new Cookies(cookies);
    }

    public appendToHeaders(header: Headers) {
        for (let c of this.cookieCollection.values()) {
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

    public add(key: string, value: string, options?: ICookieOptions) {
        this.cookieCollection.set(key, new Cookie(key, value, options));
    }

    public addCookie(cookie: Cookie) {
        this.cookieCollection.set(cookie.name, cookie);
    }

    public get(key: string): Cookie | undefined {
        return this.cookieCollection.get(key);
    }

    public update(key: string, value: string, options?: ICookieOptions): boolean {
        if (!this.cookieCollection.has(key)) {
            return false;
        } else {
            this.cookieCollection.set( key, new Cookie(key, value, options));
            return true;
        }
    }

    public remove(key: string) {
        this.cookieCollection.delete(key);
    }

    public contains(key: string): boolean {
        return this.cookieCollection.has(key);
    }

    public clear() {
        this.cookieCollection.clear();
    }
}
