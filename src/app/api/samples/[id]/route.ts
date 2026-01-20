import { db } from "@/db";
import { voiceSamples } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { unlink, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import path from "path";
import crypto from "crypto";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Get sample to find user ID and file path
        const sample = await db.query.voiceSamples.findFirst({
            where: eq(voiceSamples.id, id),
        });

        if (!sample) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Optional: Check if user is owner (or admin)
        // if (sample.userId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

        // Delete file from disk
        // Extract filename. Handle both /api/files/filename.ext and /uploads/filename.ext
        const filename = sample.audioPath.split('/').pop();
        if (filename) {
            // Try deleting from private uploads (new location)
            const privateFilePath = join(process.cwd(), "uploads", filename);

            // Try deleting from public uploads (legacy location)
            const publicFilePath = join(process.cwd(), "public", "uploads", filename);

            try {
                // Determine which one exists (or try both)
                // We'll try to unlink both to be sure
                await unlink(privateFilePath).catch(() => { });
                await unlink(publicFilePath).catch(() => { });
            } catch (err) {
                console.error("Failed to delete file:", err);
            }
        }

        await db.delete(voiceSamples).where(eq(voiceSamples.id, id));

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[SAMPLE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const formData = await req.formData();
        const text = formData.get("text") as string | null;
        const file = formData.get("file") as File | null;

        const currentSample = await db.query.voiceSamples.findFirst({
            where: eq(voiceSamples.id, id),
        });

        if (!currentSample) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updateData: Partial<typeof voiceSamples.$inferInsert> = {};

        if (text) {
            updateData.text = text;
        }

        if (file) {
            // Delete old file
            const oldFilename = currentSample.audioPath.split('/').pop();
            if (oldFilename) {
                const privateFilePath = join(process.cwd(), "uploads", oldFilename);
                const publicFilePath = join(process.cwd(), "public", "uploads", oldFilename);

                await unlink(privateFilePath).catch(() => { });
                await unlink(publicFilePath).catch(() => { });
            }

            // Save new file
            const buffer = Buffer.from(await file.arrayBuffer());
            const originalName = file.name;
            const ext = path.extname(originalName);
            const fileId = crypto.randomUUID();
            const fileName = `${fileId}${ext}`;

            const uploadDir = join(process.cwd(), "uploads");
            await mkdir(uploadDir, { recursive: true });

            const filePath = join(uploadDir, fileName);
            await writeFile(filePath, buffer);

            updateData.audioPath = `/api/files/${fileName}`;
            updateData.originalFileName = originalName;
        }

        if (Object.keys(updateData).length === 0) {
            return new NextResponse("No changes", { status: 400 });
        }

        const [updatedSample] = await db.update(voiceSamples)
            .set(updateData)
            .where(eq(voiceSamples.id, id))
            .returning();

        return NextResponse.json(updatedSample);

    } catch (error) {
        console.error("[SAMPLE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
