"use client";

import { use, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Package, Truck, Download } from "lucide-react";
import { ORDERS } from "@/lib/demo-data";
import { formatPrice, cn } from "@/lib/utils";

function groupByWilaya(orders: typeof ORDERS) {
    const groups: Record<string, typeof ORDERS> = {};
    orders.forEach((o) => { if (!groups[o.wilaya]) groups[o.wilaya] = []; groups[o.wilaya].push(o); });
    return Object.entries(groups)
        .map(([wilaya, orders]) => ({
            wilaya, orders,
            totalItems: orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.qty, 0), 0),
            totalValue: orders.reduce((s, o) => s + o.total, 0),
        }))
        .sort((a, b) => b.orders.length - a.orders.length);
}

export default function AdminLogisticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredOrders = useMemo(() => statusFilter === "all" ? ORDERS : ORDERS.filter((o) => o.status === statusFilter), [statusFilter]);
    const zones = useMemo(() => groupByWilaya(filteredOrders), [filteredOrders]);
    const totalValue = filteredOrders.reduce((s, o) => s + o.total, 0);

    const exportManifest = () => {
        const header = "Order #,Customer,Wilaya,Commune,Address,Items,Total (centimes),Status\n";
        const rows = filteredOrders.map((o) => {
            const items = o.items.map((i) => `${i.name} x${i.qty}`).join(" | ");
            const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
            return [o.orderNumber, esc(o.customerName), esc(o.wilaya), esc(o.commune), esc(o.address), esc(items), o.total, o.status].join(",");
        }).join("\n");
        const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manifest-${statusFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Logistics</h1>
                    <p className="text-sm text-[var(--text-muted)]">Orders grouped by delivery zone</p>
                </div>
                <button onClick={exportManifest} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-4 py-2.5 text-sm text-[var(--text-secondary)] shadow-sm hover:bg-[var(--bg-elevated)]">
                    <Download className="h-4 w-4" /> Export Manifest
                </button>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard icon={MapPin} color="var(--jade)" bg="var(--jade-light)" label="Delivery Zones" value={zones.length.toString()} />
                <StatCard icon={Package} color="var(--gold)" bg="var(--gold-muted)" label="Orders" value={filteredOrders.length.toString()} />
                <StatCard icon={Truck} color="var(--info)" bg="var(--info-muted)" label="Total Value" value={formatPrice(totalValue)} />
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto">
                {["all", "pending", "confirmed", "shipping", "delivered"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={cn("rounded-xl px-4 py-2 text-sm capitalize whitespace-nowrap",
                            statusFilter === s ? "bg-[var(--jade-light)] text-[var(--jade)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {zones.map((zone, i) => (
                    <motion.div key={zone.wilaya} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--jade-light)]">
                                    <MapPin className="h-5 w-5 text-[var(--jade)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">{zone.wilaya}</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{zone.orders.length} orders • {zone.totalItems} items</p>
                                </div>
                            </div>
                            <span className="font-mono text-sm font-bold text-[var(--gold)]">{formatPrice(zone.totalValue)}</span>
                        </div>
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {zone.orders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 px-5 py-3">
                                    <span className="font-mono text-xs text-[var(--text-muted)]">#{order.orderNumber}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--text-primary)] truncate">{order.customerName}</p>
                                        <p className="text-[11px] text-[var(--text-muted)] truncate">{order.commune} — {order.address}</p>
                                    </div>
                                    <StatusChip status={order.status} />
                                    <span className="font-mono text-xs text-[var(--text-secondary)]">{formatPrice(order.total)}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {zones.length === 0 && (
                <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
                    <Truck className="mb-3 h-10 w-10" /> <p className="text-sm">No orders in this status</p>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, color, bg, label, value }: { icon: typeof MapPin; color: string; bg: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
            </div>
        </div>
    );
}

function StatusChip({ status }: { status: string }) {
    const styles: Record<string, { bg: string; text: string }> = {
        pending: { bg: "var(--warning-muted)", text: "var(--warning)" },
        confirmed: { bg: "var(--jade-light)", text: "var(--jade)" },
        shipping: { bg: "var(--info-muted)", text: "var(--info)" },
        delivered: { bg: "rgba(74,124,89,0.12)", text: "var(--jade-hover)" },
    };
    const s = styles[status] || styles.pending;
    return <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize" style={{ background: s.bg, color: s.text }}>{status}</span>;
}
