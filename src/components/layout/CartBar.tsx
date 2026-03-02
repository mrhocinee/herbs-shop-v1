"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartBar() {
    const { items, getTotalItems, getTotalPrice, removeItem, updateQuantity, clear } = useCartStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    if (!mounted || (totalItems === 0 && !drawerOpen)) return null;

    return (
        <>
            {/* Floating Cart Button (Right Side) */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed z-40 md:hidden"
                style={{ bottom: "10rem", right: "1.5rem" }} // Above WhatsApp button (bottom-24 is 6rem)
            >
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-2xl border border-[var(--border-subtle)] transition-transform hover:scale-105"
                >
                    <ShoppingBag className="h-6 w-6 text-[var(--jade)]" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {totalItems}
                    </span>
                </button>
            </motion.div>

            {/* Desktop Cart Button Header Link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-4 right-6 z-40 hidden md:block"
            >
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[var(--border-default)] shadow-sm hover:bg-[var(--bg-elevated)] transition-colors"
                >
                    <ShoppingBag className="h-5 w-5 text-[var(--jade)]" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {totalItems}
                    </span>
                </button>
            </motion.div>

            {/* Cart Sidebar Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 35 }}
                            className="fixed inset-y-0 right-0 z-50 flex w-[90vw] max-w-sm flex-col bg-white shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    Your Cart ({totalItems})
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button onClick={clear} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
                                        Clear all
                                    </button>
                                    <button onClick={() => setDrawerOpen(false)} className="rounded-full rounded-full bg-[var(--bg-base)] p-2 hover:bg-[var(--bg-elevated)] transition-colors">
                                        <X className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </button>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-[var(--text-muted)]">
                                        <ShoppingBag className="mb-4 h-12 w-12 opacity-50" />
                                        <p className="text-base text-[var(--text-secondary)]">Your cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[var(--border-subtle)]">
                                        {items.map((item) => (
                                            <div key={item.productId} className="flex gap-4 p-6">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--jade-light)]">
                                                    <span className="text-2xl">🌿</span>
                                                </div>
                                                <div className="flex flex-1 flex-col py-1 min-w-0">
                                                    <p className="text-base font-semibold text-[var(--text-primary)] truncate">{item.name}</p>
                                                    <p className="font-mono text-xs text-[var(--gold)] mt-0.5">{formatPrice(item.price)} each</p>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center rounded-lg border border-[var(--border-default)] p-0.5">
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-mono text-[15px] font-bold text-[var(--text-primary)]">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </p>
                                                            <button
                                                                onClick={() => removeItem(item.productId)}
                                                                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--error-muted)] hover:text-[var(--error)] transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {items.length > 0 && (
                                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-base font-medium text-[var(--text-secondary)]">Subtotal</span>
                                        <span className="font-mono text-xl font-bold text-[var(--gold)]">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <p className="mb-4 text-center text-xs text-[var(--text-muted)]">Shipping fees calculated at checkout</p>
                                    <Link
                                        href="/fr/checkout"
                                        onClick={() => setDrawerOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--jade)] px-4 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[var(--jade-hover)]"
                                    >
                                        Proceed to Checkout
                                    </Link>
                                    <button
                                        onClick={() => setDrawerOpen(false)}
                                        className="mt-3 w-full py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
