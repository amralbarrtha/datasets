import { db } from "@/db";
import { voiceSamples } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { join } from "path";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const text = formData.get("text") as string;

        if (!file || !text) {
            return new NextResponse("File and text are required", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name;
        const ext = path.extname(originalName);
        const fileId = crypto.randomUUID();
        const fileName = `${fileId}${ext}`;

        // Ensure private uploads directory exists
        const uploadDir = join(process.cwd(), "uploads");
        await mkdir(uploadDir, { recursive: true });

        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Path to serve via protected API
        const publicPath = `/api/files/${fileName}`;

        const [sample] = await db
            .insert(voiceSamples)
            .values({
                text,
                audioPath: publicPath,
                datasetId: id,
                userId: session.user.id,
                originalFileName: file.name, // Save original filename
            })
            .returning();

        return NextResponse.json(sample);
    } catch (error) {
        console.error("[SAMPLES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
