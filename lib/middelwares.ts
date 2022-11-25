import { UranusRequest, UranusResponse } from "./uranusHTTP.ts";

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
