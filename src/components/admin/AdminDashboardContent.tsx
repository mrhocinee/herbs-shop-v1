"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, ShoppingCart, TrendingUp, AlertTriangle,
    ArrowUpRight, Clock, CheckCircle, Truck, Plus, Check, Settings2,
} from "lucide-react";
import { PRODUCTS, ORDERS } from "@/lib/demo-data";
import { formatPrice, cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardContent({ locale }: { locale: string }) {
    const [mounted, setMounted] = useState(false);
    const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});
    const [justRestocked, setJustRestocked] = useState<Record<string, number>>({});
    const [showThresholdSettings, setShowThresholdSettings] = useState(false);
    const router = useRouter();

    const {
        products, getStock, addStock, isLowStock,
        lowStockThreshold, setLowStockThreshold,
        getLowStockThreshold, setProductThreshold,
    } = useAdminStore();

    useEffect(() => setMounted(true), []);

    const handleLogout = () => {
        sessionStorage.removeItem("hv-admin-auth");
        router.replace(`/${locale}`);
    };

    // Products with their live stock from the persistent store
    const lowStock = products.filter((p) => isLowStock(p.id) || justRestocked[p.id] !== undefined);
    const outOfStock = products.filter((p) => getStock(p.id) === 0);
    const pendingOrders = ORDERS.filter((o) => o.status === "pending");
    const revenue = ORDERS.filter((o) => o.status !== "pending").reduce((s, o) => s + o.total, 0);

    const handleRestock = (productId: string) => {
        const amount = restockAmounts[productId] || 10;
        addStock(productId, amount);
        setJustRestocked((prev) => ({ ...prev, [productId]: amount }));
        setTimeout(() => {
            setJustRestocked((prev) => { const next = { ...prev }; delete next[productId]; return next; });
        }, 2500);
        setRestockAmounts((prev) => { const next = { ...prev }; delete next[productId]; return next; });
    };

    const stats = [
        {
            label: "Products", value: PRODUCTS.length.toString(), sub: `${lowStock.length} low stock`,
            icon: Package, color: "var(--jade)", bg: "var(--jade-light)"
        },
        {
            label: "Pending Orders", value: pendingOrders.length.toString(), sub: `${ORDERS.length} total`,
            icon: ShoppingCart, color: "var(--warning)", bg: "var(--warning-muted)"
        },
        {
            label: "Revenue (COD)", value: formatPrice(revenue), sub: "confirmed + delivered",
            icon: TrendingUp, color: "var(--gold)", bg: "var(--gold-muted)"
        },
        {
            label: "Low Stock Alerts", value: lowStock.length.toString(), sub: `${outOfStock.length} out of stock`,
            icon: AlertTriangle, color: "var(--error)", bg: "var(--error-muted)"
        },
    ];

    if (!mounted) return null;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-sm text-[var(--text-muted)]">Overview of your herb shop</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-[var(--error-muted)] px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)] hover:text-white"
                >
                    Logout
                </button>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }} className="rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                        <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Orders</h2>
                        <Link href={`/${locale}/admin/orders`} className="text-xs text-[var(--jade)] hover:underline">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {ORDERS.slice(0, 4).map((order) => {
                            const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
                                pending: { icon: Clock, color: "var(--warning)" },
                                confirmed: { icon: CheckCircle, color: "var(--jade)" },
                                shipping: { icon: Truck, color: "var(--info)" },
                                delivered: { icon: CheckCircle, color: "var(--jade-hover)" },
                            };
                            const cfg = statusConfig[order.status];
                            return (
                                <div key={order.id} className="flex items-center gap-3 rounded-xl bg-[var(--bg-base)] p-3">
                                    <cfg.icon className="h-4 w-4 shrink-0" style={{ color: cfg.color }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{order.customerName}</p>
                                        <p className="text-[11px] text-[var(--text-muted)]">#{order.orderNumber} • {order.wilaya}</p>
                                    </div>
                                    <span className="font-mono text-xs font-semibold text-[var(--gold)]">{formatPrice(order.total)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Low Stock Alerts</h2>
                            <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                                threshold: ≤{lowStockThreshold}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowThresholdSettings(!showThresholdSettings)}
                                className={cn("rounded-lg p-1.5 transition-colors", showThresholdSettings ? "bg-[var(--jade-light)] text-[var(--jade)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}>
                                <Settings2 className="h-4 w-4" />
                            </button>
                            <Link href={`/${locale}/admin/products`} className="text-xs text-[var(--jade)] hover:underline">Manage →</Link>
                        </div>
                    </div>

                    {/* Threshold Settings Panel */}
                    <AnimatePresence>
                        {showThresholdSettings && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="mb-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4 space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Global Low Stock Threshold</label>
                                        <p className="mb-2 text-[11px] text-[var(--text-muted)]">Alert when any product stock falls to this level or below</p>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="1" max="100" value={lowStockThreshold}
                                                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
                                                className="h-9 w-20 rounded-lg border border-[var(--border-default)] bg-white px-3 text-center font-mono text-sm text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none" />
                                            <span className="text-xs text-[var(--text-muted)]">units</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--border-subtle)] pt-3">
                                        <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">Per-Product Thresholds</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {PRODUCTS.map((p) => {
                                                const perThreshold = getLowStockThreshold(p.id);
                                                return (
                                                    <div key={p.id} className="flex items-center gap-2">
                                                        <span className="flex-1 text-xs text-[var(--text-secondary)] truncate">{p.nameEn}</span>
                                                        <input type="number" min="1" max="999" value={perThreshold}
                                                            onChange={(e) => setProductThreshold(p.id, parseInt(e.target.value) || lowStockThreshold)}
                                                            className="h-7 w-16 rounded-md border border-[var(--border-default)] bg-white px-2 text-center font-mono text-xs text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Low Stock Items */}
                    {lowStock.length > 0 ? (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {lowStock.map((p) => {
                                    const isRestocked = justRestocked[p.id] !== undefined;
                                    const threshold = getLowStockThreshold(p.id);
                                    return (
                                        <motion.div key={p.id} layout exit={{ opacity: 0, x: 40, height: 0 }} transition={{ duration: 0.25 }}
                                            className={cn("flex items-center gap-3 rounded-xl p-3", isRestocked ? "bg-[var(--jade-light)]" : "bg-[var(--bg-base)]")}>
                                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", isRestocked ? "bg-[var(--jade)]/10" : "bg-[var(--error-muted)]")}>
                                                {isRestocked
                                                    ? <Check className="h-4 w-4 text-[var(--jade)]" />
                                                    : <AlertTriangle className="h-4 w-4 text-[var(--error)]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.nameEn}</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{formatPrice(p.price)} • alert ≤{threshold}</p>
                                            </div>
                                            <span className={cn("font-mono text-sm font-bold",
                                                isRestocked ? "text-[var(--jade)]" :
                                                    p.stock <= Math.floor(threshold / 2) ? "text-[var(--error)]" : "text-[var(--warning)]")}>
                                                {p.stock}
                                            </span>

                                            {!isRestocked && (
                                                <div className="flex items-center gap-1.5">
                                                    <input type="number" min="1" value={restockAmounts[p.id] ?? 10}
                                                        onChange={(e) => setRestockAmounts((prev) => ({ ...prev, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                                        className="h-8 w-14 rounded-lg border border-[var(--border-default)] bg-white px-2 text-center font-mono text-xs text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none" />
                                                    <button onClick={() => handleRestock(p.id)}
                                                        className="flex h-8 items-center gap-1 rounded-lg bg-[var(--jade)] px-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--jade-hover)]">
                                                        <Plus className="h-3.5 w-3.5" /> Add
                                                    </button>
                                                </div>
                                            )}
                                            {isRestocked && (
                                                <span className="text-xs font-semibold text-[var(--jade)]">+{justRestocked[p.id]} added ✓</span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <p className="py-8 text-center text-sm text-[var(--text-muted)]">All products well-stocked ✓</p>
                    )}
                </div>
            </div>
        </div>
    );
}
