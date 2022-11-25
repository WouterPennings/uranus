import { UranusRequest, UranusResponse } from "../lib/uranusHTTP.ts";

export const testMiddleware = async (
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
