export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const allCats = await db.query.categories.findMany({
            orderBy: [asc(categories.sortOrder)],
        });
        return NextResponse.json(allCats);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newCat = await db.insert(categories).values(body).returning();
        return NextResponse.json(newCat[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
