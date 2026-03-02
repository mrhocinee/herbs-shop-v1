export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allProducts = await db.query.products.findMany({
            orderBy: [desc(products.createdAt)],
            with: {
                category: true,
            },
        });
        return NextResponse.json(allProducts);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Basic validation could be added here (e.g., using Zod)
        const newProduct = await db.insert(products).values(body).returning();
        return NextResponse.json(newProduct[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
