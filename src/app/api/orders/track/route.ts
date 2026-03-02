import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { ORDERS as DEMO_ORDERS } from "@/lib/demo-data";

// GET /api/orders/track?phone=...&order=...
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const orderNum = searchParams.get("order");

    if (!phone && !orderNum) {
        return NextResponse.json(
            { error: "Please provide a phone number or order number" },
            { status: 400 }
        );
    }

    try {
        // Try database first
        const conditions = [];
        if (orderNum) {
            conditions.push(eq(orders.orderNumber, parseInt(orderNum)));
        }

        const results = await db.query.orders.findMany({
            orderBy: [desc(orders.createdAt)],
            with: { items: { with: { product: true } } },
        });

        // Filter by phone or order number
        const matched = results.filter((o) => {
            if (orderNum && o.orderNumber === parseInt(orderNum)) return true;
            if (phone) {
                const addr = o.shippingAddress as any;
                if (addr?.phone?.includes(phone)) return true;
            }
            return false;
        });

        if (matched.length > 0) {
            const mapped = matched.map((o) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                status: o.status,
                total: o.totalAmount,
                shippingFee: o.shippingFee,
                wilaya: o.wilaya,
                items: (o.items || []).map((item: any) => ({
                    name: item.product?.nameEn ?? "Product",
                    qty: item.quantity,
                    price: item.unitPrice,
                })),
                createdAt: o.createdAt,
                confirmedAt: o.confirmedAt,
                shippedAt: o.shippedAt,
                deliveredAt: o.deliveredAt,
            }));
            return NextResponse.json(mapped);
        }

        // Fallback to demo data
        const demoMatched = DEMO_ORDERS.filter((o) => {
            if (orderNum && o.orderNumber === parseInt(orderNum)) return true;
            if (phone && o.customerPhone?.includes(phone)) return true;
            return false;
        });

        if (demoMatched.length > 0) {
            return NextResponse.json(
                demoMatched.map((o) => ({
                    ...o,
                    confirmedAt: o.status !== "pending" ? o.createdAt : null,
                    shippedAt: o.status === "shipping" || o.status === "delivered" ? o.createdAt : null,
                    deliveredAt: o.status === "delivered" ? o.createdAt : null,
                }))
            );
        }

        return NextResponse.json([]);
    } catch (error) {
        console.error("Track API error:", error);

        // Fallback to demo data on DB error
        const demoMatched = DEMO_ORDERS.filter((o) => {
            if (orderNum && o.orderNumber === parseInt(orderNum)) return true;
            if (phone && o.customerPhone?.includes(phone)) return true;
            return false;
        });

        return NextResponse.json(
            demoMatched.map((o) => ({
                ...o,
                confirmedAt: o.status !== "pending" ? o.createdAt : null,
                shippedAt: o.status === "shipping" || o.status === "delivered" ? o.createdAt : null,
                deliveredAt: o.status === "delivered" ? o.createdAt : null,
            }))
        );
    }
}
