import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const session = await getServerSession(authOptions);
    const { filename } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const filePath = join(process.cwd(), "uploads", filename);

        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Simple mime type detection based on extension
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === 'mp3') contentType = 'audio/mpeg';
        else if (ext === 'wav') contentType = 'audio/wav';
        else if (ext === 'ogg') contentType = 'audio/ogg';
        else if (ext === 'm4a') contentType = 'audio/mp4';
        else if (ext === 'webm') contentType = 'audio/webm';

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("[FILE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
