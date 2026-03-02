"use client";

import { use, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, ChevronRight, AlertTriangle, Leaf, MapPin, Minus, Plus } from "lucide-react";
import { CATEGORIES, type Product } from "@/lib/demo-data";
import { formatPrice, getLocalizedField, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAdminStore } from "@/stores/admin-store";

const TABS = ["ingredients", "usage", "warnings", "origin"] as const;
type Tab = (typeof TABS)[number];

const tabLabels: Record<Tab, Record<string, string>> = {
    ingredients: { en: "Ingredients", fr: "Ingrédients", ar: "المكونات" },
    usage: { en: "How to Use", fr: "Utilisation", ar: "طريقة الاستخدام" },
    warnings: { en: "Warnings", fr: "Avertissements", ar: "تحذيرات" },
    origin: { en: "Origin", fr: "Origine", ar: "المنشأ" },
};

export default function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = use(params);
    const { products } = useAdminStore();
    const product = products.find((p) => p.slug === slug);
    if (!product) return notFound();

    const category = CATEGORIES.find((c) => c.id === product.categoryId);
    const related = products.filter((p: Product) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 3);

    const addItem = useCartStore((s) => s.addItem);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState<Tab>("ingredients");
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addItem({ productId: product.id, slug: product.slug, name: getLocalizedField(product, "name", locale), price: product.price, maxStock: product.stock, quantity: qty });
        setAdded(true);
        setTimeout(() => setAdded(false), 800);
    };

    const tabContent = () => {
        switch (activeTab) {
            case "ingredients": return getLocalizedField(product, "ingredients", locale) || "—";
            case "usage": return getLocalizedField(product, "usage", locale) || "—";
            case "warnings": return getLocalizedField(product, "warnings", locale) || "—";
            case "origin": return product.origin || "—";
        }
    };

    return (
        <div className="min-h-screen px-6 py-8 sm:px-10">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Link href={`/${locale}`} className="hover:text-[var(--jade)] transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                {category && (
                    <>
                        <Link href={`/${locale}/category/${category.slug}`} className="hover:text-[var(--jade)] transition-colors">
                            {getLocalizedField(category, "name", locale)}
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                    </>
                )}
                <span className="text-[var(--text-secondary)] truncate">{getLocalizedField(product, "name", locale)}</span>
            </nav>

            {/* Main */}
            <div className="grid gap-10 lg:grid-cols-2">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--bg-elevated)] flex items-center justify-center shadow-sm"
                >
                    <span className="text-8xl opacity-30">🌿</span>
                    {product.badge && (
                        <span className={cn(
                            "absolute start-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                            product.badge === "new" ? "bg-[var(--jade-light)] text-[var(--jade)]" :
                                product.badge === "bestseller" ? "bg-[var(--gold-muted)] text-[var(--gold)]" :
                                    "bg-[var(--error-muted)] text-[var(--error)]"
                        )}>
                            {product.badge === "new" ? "New" : product.badge === "bestseller" ? "Best Seller" : "Limited"}
                        </span>
                    )}
                </motion.div>

                {/* Info */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    {category && (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--jade)]">
                            {getLocalizedField(category, "name", locale)}
                        </p>
                    )}

                    <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
                        {getLocalizedField(product, "name", locale)}
                    </h1>

                    {product.rating && (
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-[var(--text-muted)]/30")} />
                                ))}
                            </div>
                            <span className="text-sm text-[var(--text-muted)]">{product.rating}</span>
                        </div>
                    )}

                    <p className="mb-2 font-mono text-3xl font-bold text-[var(--gold)]">{formatPrice(product.price)}</p>
                    <p className="mb-6 text-xs text-[var(--text-muted)]">Cash on Delivery • Free returns</p>

                    <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {getLocalizedField(product, "desc", locale)}
                    </p>

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--jade-light)] px-3 py-1.5 text-xs text-[var(--jade)]">
                        <Leaf className="h-3 w-3" />
                        {getLocalizedField(product, "benefit", locale)}
                    </div>

                    <div className="mb-6">
                        {product.stock > 5 ? (
                            <p className="text-sm text-[var(--jade)]">✓ In stock</p>
                        ) : product.stock > 0 ? (
                            <p className="text-sm text-[var(--warning)]">⚡ Only {product.stock} left</p>
                        ) : (
                            <p className="text-sm text-[var(--error)]">✕ Out of stock</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-white">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-11 w-11 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex h-11 w-11 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAdd}
                            disabled={product.stock === 0}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                                "bg-[var(--jade)] text-white hover:bg-[var(--jade-hover)] shadow-lg shadow-[var(--jade)]/10",
                                product.stock === 0 && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            {added ? "Added ✓" : "Add to Cart"}
                        </motion.button>
                    </div>

                    {product.origin && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <MapPin className="h-3 w-3" /> Origin: {product.origin}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="mt-12">
                <div className="flex gap-1 border-b border-[var(--border-subtle)]">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "relative px-4 py-3 text-sm transition-colors",
                                activeTab === tab ? "text-[var(--jade)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            )}
                        >
                            {tabLabels[tab][locale] || tabLabels[tab].en}
                            {activeTab === tab && (
                                <motion.div layoutId="tab-indicator" className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-[var(--jade)] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="py-6">
                    {activeTab === "warnings" ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-[var(--warning-muted)] bg-amber-50/50 p-4">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--warning)]" />
                            <p className="text-sm text-[var(--text-secondary)]">{tabContent()}</p>
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{tabContent()}</p>
                    )}
                </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <section className="mt-12">
                    <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">You might also like</h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((p) => (
                            <ProductCard key={p.id} id={p.id} slug={p.slug} name={getLocalizedField(p, "name", locale)}
                                benefit={getLocalizedField(p, "benefit", locale)} price={p.price} stock={p.stock} rating={p.rating} badge={p.badge} locale={locale} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
