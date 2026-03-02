import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"] as const;

// PATCH /api/orders/[id]/status — Advance order status
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
                { status: 400 }
            );
        }

        // Build update object with appropriate timestamp
        const updateData: Record<string, any> = {
            status,
            updatedAt: new Date(),
        };

        if (status === "confirmed") updateData.confirmedAt = new Date();
        if (status === "out_for_delivery") updateData.shippedAt = new Date();
        if (status === "delivered") updateData.deliveredAt = new Date();

        const updated = await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, id))
            .returning({
                id: orders.id,
                status: orders.status,
                updatedAt: orders.updatedAt,
            });

        if (updated.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Failed to update order status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
