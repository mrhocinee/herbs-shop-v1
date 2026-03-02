"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, MapPin, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { WILAYAS, getShippingFee } from "@/lib/demo-data";
import { formatPrice, useHasMounted } from "@/lib/utils";
import Link from "next/link";

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const { items, getTotalPrice, getTotalItems, clear } = useCartStore();
    const hasMounted = useHasMounted();

    const totalItems = getTotalItems();
    const subtotal = getTotalPrice();

    const [formData, setFormData] = useState({ name: "", phone: "", wilaya: "", commune: "", address: "", notes: "" });

    // Avoid mismatch between SSR (empty cart) and CSR (persistent cart)
    if (!hasMounted) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-[var(--text-muted)]">
                <p className="text-sm">Loading checkout...</p>
            </div>
        );
    }
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [orderNumber, setOrderNumber] = useState(0);

    const selectedWilaya = WILAYAS.find((w) => w.code === formData.wilaya);
    const shippingFee = formData.wilaya ? getShippingFee(formData.wilaya) : 0;
    const total = subtotal + shippingFee;
    const update = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.name || formData.name.length < 3) e.name = "Name required (min 3 chars)";
        if (!formData.phone || !/^0[567]\d{8}$/.test(formData.phone)) e.phone = "Valid Algerian phone required (05/06/07)";
        if (!formData.wilaya) e.wilaya = "Please select a wilaya";
        if (!formData.address || formData.address.length < 5) e.address = "Address required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setOrderNumber(1000 + Math.floor(Math.random() * 9000));
        setSubmitted(true);
        clear();
    };

    if (submitted) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--jade-light)]">
                        <Check className="h-8 w-8 text-[var(--jade)]" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Order Confirmed!</h1>
                    <p className="mb-2 text-sm text-[var(--text-secondary)]">Your order has been placed successfully.</p>
                    <p className="mb-6 font-mono text-3xl font-bold text-[var(--jade)]">#{orderNumber}</p>
                    <p className="mb-6 text-xs text-[var(--text-muted)]">Payment: Cash on Delivery</p>
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--jade)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--jade-hover)]">
                        Continue Shopping <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (totalItems === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-[var(--text-muted)]">
                <ShoppingBag className="mb-4 h-12 w-12" />
                <p className="mb-4 text-lg">Your cart is empty</p>
                <Link href={`/${locale}`} className="text-sm text-[var(--jade)] hover:underline">Browse herbs →</Link>
            </div>
        );
    }

    return (
        <div className="px-6 py-8 sm:px-10">
            <h1 className="mb-8 text-2xl font-bold text-[var(--text-primary)]">Checkout</h1>
            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
                <div className="space-y-5 lg:col-span-3">
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-[var(--jade)]">Delivery Information</h2>
                        <Field label="Full Name" error={errors.name}>
                            <input value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder="أحمد بن محمد" className="input-field" />
                        </Field>
                        <Field label="Phone Number" error={errors.phone}>
                            <input value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0551234567" type="tel" className="input-field" />
                        </Field>
                        <Field label="Wilaya" error={errors.wilaya}>
                            <select value={formData.wilaya} onChange={(e) => update("wilaya", e.target.value)} className="input-field">
                                <option value="">Select wilaya...</option>
                                {WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.code} — {w.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Address" error={errors.address}>
                            <textarea value={formData.address} onChange={(e) => update("address", e.target.value)} rows={3} placeholder="Rue, quartier, repère..." className="input-field resize-none" />
                        </Field>
                        <Field label="Notes (optional)">
                            <textarea value={formData.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Instructions pour le livreur..." className="input-field resize-none" />
                        </Field>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="sticky top-8 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-[var(--jade)]">Order Summary</h2>
                        <div className="mb-4 space-y-3">
                            {items.map((item) => (
                                <div key={item.productId} className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-secondary)] truncate me-2">{item.name} × {item.quantity}</span>
                                    <span className="font-mono text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
                            <Row label="Subtotal" value={formatPrice(subtotal)} />
                            <Row label="Shipping" value={formData.wilaya ? formatPrice(shippingFee) : "—"} />
                            {selectedWilaya && (
                                <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><MapPin className="h-3 w-3" /> {selectedWilaya.name}</p>
                            )}
                        </div>
                        <div className="mt-4 border-t border-[var(--border-subtle)] pt-4 flex items-center justify-between">
                            <span className="font-semibold text-[var(--text-primary)]">Total</span>
                            <span className="font-mono text-xl font-bold text-[var(--gold)]">{formatPrice(total)}</span>
                        </div>
                        <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--jade)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--jade)]/10 hover:bg-[var(--jade-hover)]">
                            <ShoppingBag className="h-4 w-4" /> Confirm COD Order
                        </button>
                        <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">You pay when your order is delivered</p>
                    </div>
                </div>
            </form>

            <style jsx>{`
        .input-field {
          width: 100%; border-radius: 0.75rem; border: 1px solid var(--border-default);
          background: var(--bg-base); padding: 0.625rem 0.75rem; font-size: 0.875rem;
          color: var(--text-primary); transition: border-color 0.2s;
        }
        .input-field:focus { outline: none; border-color: var(--jade); }
        .input-field::placeholder { color: var(--text-muted); }
      `}</style>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-[var(--error)]">{error}</p>}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">{label}</span>
            <span className="font-mono text-[var(--text-secondary)]">{value}</span>
        </div>
    );
}
