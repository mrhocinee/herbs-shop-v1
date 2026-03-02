export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET /api/orders — List all orders
export async function GET() {
    try {
        const allOrders = await db.query.orders.findMany({
            orderBy: [desc(orders.createdAt)],
            with: {
                items: {
                    with: {
                        product: true,
                    },
                },
            },
        });

        // Map to the format expected by the mobile app
        const mapped = allOrders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.shippingAddress?.name ?? "Unknown",
            customerPhone: o.shippingAddress?.phone ?? "",
            wilaya: o.wilaya,
            commune: o.commune,
            address: o.shippingAddress?.street ?? "",
            items: o.items.map((item: any) => ({
                productId: item.productId,
                name: item.product?.nameEn ?? "Product",
                qty: item.quantity,
                price: item.unitPrice,
            })),
            subtotal: o.totalAmount - o.shippingFee,
            shippingFee: o.shippingFee,
            total: o.totalAmount,
            status: o.status,
            createdAt: o.createdAt,
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
