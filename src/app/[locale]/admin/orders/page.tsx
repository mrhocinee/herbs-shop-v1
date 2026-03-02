"use client";

import { use, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Truck, Clock, CheckCircle, Package } from "lucide-react";
import { ORDERS as INITIAL_ORDERS } from "@/lib/demo-data";
import { formatPrice, cn, matchSearch } from "@/lib/utils";

const STATUS_FLOW = ["pending", "confirmed", "shipping", "delivered"] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    pending: { label: "Pending", color: "var(--warning)", bg: "var(--warning-muted)", icon: Clock },
    confirmed: { label: "Confirmed", color: "var(--jade)", bg: "var(--jade-light)", icon: CheckCircle },
    shipping: { label: "Shipping", color: "var(--info)", bg: "var(--info-muted)", icon: Truck },
    delivered: { label: "Delivered", color: "var(--jade-hover)", bg: "rgba(74,124,89,0.12)", icon: CheckCircle },
};

export default function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [statusTab, setStatusTab] = useState("all");
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const matchStatus = statusTab === "all" || o.status === statusTab;
            const matchQuery = matchSearch(search, [o.customerName, o.customerPhone, o.orderNumber.toString()]);
            return matchStatus && matchQuery;
        });
    }, [orders, statusTab, search]);

    const statusCounts = useMemo(() => {
        const c: Record<string, number> = { all: orders.length };
        orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
        return c;
    }, [orders]);

    const advanceStatus = (orderId: string) => {
        setOrders((prev) => prev.map((o) => {
            if (o.id !== orderId) return o;
            const idx = STATUS_FLOW.indexOf(o.status as typeof STATUS_FLOW[number]);
            if (idx >= STATUS_FLOW.length - 1) return o;
            return { ...o, status: STATUS_FLOW[idx + 1] };
        }));
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <span>{orders.length} total orders</span>
                    {search && (
                        <>
                            <span className="h-1 w-1 rounded-full bg-[var(--border-default)]" />
                            <span className="text-[var(--jade)] font-medium">{filtered.length} results for "{search}"</span>
                        </>
                    )}
                </div>
            </div>

            {/* Status Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto">
                {["all", ...STATUS_FLOW].map((s) => (
                    <button key={s} onClick={() => setStatusTab(s)}
                        className={cn("rounded-xl px-4 py-2 text-sm capitalize transition-colors whitespace-nowrap",
                            statusTab === s ? "bg-[var(--jade-light)] text-[var(--jade)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                        )}>
                        {s} <span className="ms-1 text-xs opacity-70">({statusCounts[s] || 0})</span>
                    </button>
                ))}
            </div>

            <div className="relative mb-6 max-w-sm group">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 z-20">
                    <Search className="h-4 w-4 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--jade)]" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or #..."
                    className="relative z-10 w-full cursor-text rounded-xl border border-[var(--border-default)] bg-white py-2.5 pe-4 ps-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--jade)] focus:outline-none focus:ring-1 focus:ring-[var(--jade)]/20 shadow-sm"
                />
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filtered.map((order) => {
                    const cfg = STATUS_CONFIG[order.status];
                    const isOpen = expanded === order.id;
                    const nextIdx = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]) + 1;
                    const nextStatus = nextIdx < STATUS_FLOW.length ? STATUS_FLOW[nextIdx] : null;

                    return (
                        <motion.div key={order.id} layout className="rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
                            <button onClick={() => setExpanded(isOpen ? null : order.id)}
                                className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-[var(--bg-base)]">
                                <cfg.icon className="h-4 w-4 shrink-0" style={{ color: cfg.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{order.customerName}</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">#{order.orderNumber} • {order.wilaya}</p>
                                </div>
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize" style={{ background: cfg.bg, color: cfg.color }}>
                                    {cfg.label}
                                </span>
                                <span className="font-mono text-xs font-semibold text-[var(--gold)]">{formatPrice(order.total)}</span>
                                {isOpen ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="border-t border-[var(--border-subtle)] p-5 space-y-4">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-[11px] text-[var(--text-muted)]">Customer</p>
                                                    <p className="text-sm text-[var(--text-primary)]">{order.customerName}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{order.customerPhone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-[var(--text-muted)]">Delivery</p>
                                                    <p className="text-sm text-[var(--text-primary)]">{order.wilaya}, {order.commune}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{order.address}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="mb-2 text-[11px] text-[var(--text-muted)]">Items</p>
                                                <div className="space-y-1">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-sm">
                                                            <span className="text-[var(--text-secondary)]">{item.name} × {item.qty}</span>
                                                            <span className="font-mono text-[var(--text-primary)]">{formatPrice(item.price * item.qty)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {nextStatus && (
                                                <button onClick={() => advanceStatus(order.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--jade)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--jade-hover)]">
                                                    <Truck className="h-4 w-4" /> Mark as {STATUS_CONFIG[nextStatus].label}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
                    <Package className="mb-3 h-10 w-10" /> <p className="text-sm">No orders found</p>
                </div>
            )}
        </div>
    );
}
