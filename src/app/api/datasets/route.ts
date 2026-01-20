import { db } from "@/db";
import { datasets } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const [dataset] = await db
            .insert(datasets)
            .values({
                name,
                description,
                userId: session.user.id, // Save creator ID
            })
            .returning();

        return NextResponse.json(dataset);
    } catch (error) {
        console.error("[DATASETS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
