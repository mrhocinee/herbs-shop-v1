"use client";

import { use, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { CATEGORIES } from "@/lib/demo-data";
import { getLocalizedField, cn } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import { useAdminStore } from "@/stores/admin-store";
import Link from "next/link";
import { notFound } from "next/navigation";

type SortKey = "default" | "price-asc" | "price-desc" | "rating";

export default function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = use(params);
    const { products } = useAdminStore();
    const category = CATEGORIES.find((c) => c.slug === slug);
    if (!category) return notFound();

    const [sort, setSort] = useState<SortKey>("default");

    const categoryProducts = products.filter((p) => p.categoryId === category.id);
    const sorted = [...categoryProducts].sort((a, b) => {
        switch (sort) {
            case "price-asc": return a.price - b.price;
            case "price-desc": return b.price - a.price;
            case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
            default: return 0;
        }
    });

    return (
        <div className="min-h-screen px-6 py-8 sm:px-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-10 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-white p-8 shadow-sm sm:p-12"
            >
                <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[var(--jade)]/[0.04] blur-[60px]" />
                <div className="relative">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--jade)]">Collection</p>
                    <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
                        {getLocalizedField(category, "name", locale)}
                    </h1>
                    <p className="max-w-xl text-sm text-[var(--text-secondary)]">
                        {getLocalizedField(category, "desc", locale)}
                    </p>
                    <p className="mt-4 text-sm text-[var(--text-muted)]">{sorted.length} herbs</p>
                </div>
            </motion.div>

            {/* Sort */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">{sorted.length} results</p>
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-[var(--text-muted)]" />
                    {(["default", "price-asc", "price-desc", "rating"] as SortKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSort(key)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs transition-colors",
                                sort === key
                                    ? "bg-[var(--jade-light)] text-[var(--jade)] font-medium"
                                    : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
                            )}
                        >
                            {key === "default" ? "Default" : key === "price-asc" ? "Price ↑" : key === "price-desc" ? "Price ↓" : "Rating"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {sorted.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sorted.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <ProductCard id={p.id} slug={p.slug} name={getLocalizedField(p, "name", locale)}
                                benefit={getLocalizedField(p, "benefit", locale)} price={p.price} stock={p.stock} rating={p.rating} badge={p.badge} locale={locale} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-20 text-[var(--text-muted)]">
                    <Filter className="mb-3 h-10 w-10" />
                    <p>No herbs in this collection</p>
                </div>
            )}
        </div>
    );
}
