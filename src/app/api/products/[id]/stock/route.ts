import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/products/[id]/stock — Update stock for a product
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { stock } = await req.json();

        if (typeof stock !== "number" || stock < 0) {
            return NextResponse.json(
                { error: "Invalid stock value. Must be a non-negative number." },
                { status: 400 }
            );
        }

        const updated = await db
            .update(products)
            .set({ stock, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning({ id: products.id, stock: products.stock, updatedAt: products.updatedAt });

        if (updated.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Failed to update stock:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
