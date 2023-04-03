import { UranusRequest, UranusResponse } from "./uranusHTTP.ts";
import { v1 } from "https://deno.land/std@0.165.0/uuid/mod.ts";
import { Cookie } from "./cookies.ts";

export const requestLogger = async (
    req: UranusRequest,
    res: UranusResponse,
) => {
    const file = await Deno.open("logger.log", {
        create: true,
        write: true,
        append: true,
    });
    const encoder = new TextEncoder();
    const writer = file.writable.getWriter();
    await writer.write(encoder.encode("{\n"));
    req.header.forEach(async (key, value) => {
        await writer.write(encoder.encode(`\t"${key}": "${value}",\n`));
    });
    await writer.write(encoder.encode("},\n"));
    file.close();
};

export class Sessions {
    private cookie_id: string;
    private sessions: {[key: string]: any};

    constructor(cookie_id: string = "session_key") {
        this.cookie_id = cookie_id;
        this.sessions = {};
    }

    public async sessions_handler(req: UranusRequest, res: UranusResponse): Promise<void> {
        if(req.cookies.contains(this.cookie_id)) {
            const value = req.cookies.get(this.cookie_id);
            if(value == undefined) {
                const uuid = v1.generate() as string;
                this.sessions[uuid] = {};
            } else {
                req.unsafeData.sessions[(value as Cookie).value] = this.sessions[(value as Cookie).value];
            }
        } else {
            const uuid = v1.generate() as string;
            res.cookies.add(this.cookie_id, uuid)
            
            this.sessions[uuid] = {};
        }
    }
}

