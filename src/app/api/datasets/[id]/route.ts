import { db } from "@/db";
import { datasets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const dataset = await db.query.datasets.findFirst({
        where: eq(datasets.id, id),
    });

    if (!dataset) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(dataset);
}

import { voiceSamples } from "@/db/schema";
import { unlink } from "fs/promises";
import { join } from "path";

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
        // Fetch all samples associated with this dataset
        const samples = await db.query.voiceSamples.findMany({
            where: eq(voiceSamples.datasetId, id),
        });

        // Delete files from disk
        for (const sample of samples) {
            const filename = sample.audioPath.split('/').pop();
            if (filename) {
                const privateFilePath = join(process.cwd(), "uploads", filename);
                const publicFilePath = join(process.cwd(), "public", "uploads", filename);

                await unlink(privateFilePath).catch(() => { });
                await unlink(publicFilePath).catch(() => { });
            }
        }

        // Delete dataset (cascade will remove samples from DB)
        await db.delete(datasets).where(eq(datasets.id, id));
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[DATASET_DELETE]", error);
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
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const [updated] = await db.update(datasets)
            .set({ name, description, updatedAt: new Date() })
            .where(eq(datasets.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[DATASET_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
