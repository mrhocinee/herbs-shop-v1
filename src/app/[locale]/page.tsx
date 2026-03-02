"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice, getLocalizedField, cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Flame, ArrowRight, Leaf } from "lucide-react";
import { use } from "react";
import { CATEGORIES, type Product } from "@/lib/demo-data";
import { useAdminStore } from "@/stores/admin-store";
import Link from "next/link";

const t: Record<string, Record<string, string>> = {
    en: {
        heroTitle: "Discover Natural Healing",
        heroSub: "Premium Chinese medical herbs, delivered across Algeria",
        shopNow: "Shop Now",
        featured: "Staff Picks",
        popular: "Most Popular",
        newArrivals: "New Arrivals",
        collections: "Browse Collections",
        viewAll: "View all",
    },
    fr: {
        heroTitle: "Découvrez la Guérison Naturelle",
        heroSub: "Herbes médicinales chinoises premium, livrées partout en Algérie",
        shopNow: "Acheter maintenant",
        featured: "Sélection du personnel",
        popular: "Plus populaires",
        newArrivals: "Nouveautés",
        collections: "Parcourir les collections",
        viewAll: "Voir tout",
    },
    ar: {
        heroTitle: "اكتشف الشفاء الطبيعي",
        heroSub: "أعشاب طبية صينية مميزة، توصيل عبر كل الجزائر",
        shopNow: "تسوق الآن",
        featured: "اختيارات الخبراء",
        popular: "الأكثر شعبية",
        newArrivals: "جديد",
        collections: "تصفح المجموعات",
        viewAll: "عرض الكل",
    },
};

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const lang = t[locale] ?? t.en;
    const { products } = useAdminStore();

    const bestsellers = products.filter((p) => p.badge === "bestseller" || p.rating >= 4.8);
    const newProducts = products.filter((p) => p.badge === "new");
    const featured = products.slice(0, 4);

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden px-6 py-16 sm:px-10 sm:py-24">
                {/* Organic background shapes */}
                <div className="pointer-events-none absolute -start-32 -top-32 h-72 w-72 rounded-full bg-[var(--jade)]/[0.04] blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-16 end-10 h-48 w-48 rounded-full bg-[var(--gold)]/[0.05] blur-[60px]" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative mx-auto max-w-2xl text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-4 py-1.5 text-xs text-[var(--jade)] shadow-sm"
                    >
                        <Leaf className="h-3.5 w-3.5" />
                        <span>Traditional Chinese Medicine</span>
                    </motion.div>

                    <h1 className="mb-4 text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl">
                        {lang.heroTitle}
                    </h1>
                    <p className="mb-8 text-base text-[var(--text-secondary)] sm:text-lg">
                        {lang.heroSub}
                    </p>

                    <Link
                        href={`/${locale}/category/roots`}
                        className="group inline-flex items-center gap-2 rounded-full bg-[var(--jade)] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[var(--jade)]/10 transition-all hover:bg-[var(--jade-hover)] hover:shadow-xl hover:shadow-[var(--jade)]/15"
                    >
                        {lang.shopNow}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </motion.div>
            </section>

            {/* Collections */}
            <section className="px-6 pb-12 sm:px-10">
                <SectionHeader title={lang.collections} icon={<Leaf className="h-5 w-5 text-[var(--jade)]" />} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link
                                href={`/${locale}/category/${cat.slug}`}
                                className="group flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--border-hover)]"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--jade-light)]">
                                    <span className="text-lg">🌿</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                        {getLocalizedField(cat, "name", locale)}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{cat.productCount} herbs</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Product Sections */}
            <div className="space-y-14 px-6 pb-16 sm:px-10">
                <ProductSection
                    title={lang.featured}
                    icon={<Sparkles className="h-5 w-5 text-[var(--jade)]" />}
                    viewAllText={lang.viewAll}
                    products={featured}
                    locale={locale}
                />
                <ProductSection
                    title={lang.popular}
                    icon={<TrendingUp className="h-5 w-5 text-[var(--gold)]" />}
                    viewAllText={lang.viewAll}
                    products={bestsellers.slice(0, 4)}
                    locale={locale}
                />
                {newProducts.length > 0 && (
                    <ProductSection
                        title={lang.newArrivals}
                        icon={<Flame className="h-5 w-5 text-[var(--error)]" />}
                        viewAllText={lang.viewAll}
                        products={newProducts}
                        locale={locale}
                    />
                )}
            </div>
        </div>
    );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        </div>
    );
}

function ProductSection({
    title, icon, viewAllText, products, locale,
}: {
    title: string; icon: React.ReactNode; viewAllText: string;
    products: Product[]; locale: string;
}) {
    return (
        <section>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
                </div>
                <button className="flex items-center gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--jade)]">
                    {viewAllText}
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                    <ProductCard
                        key={p.id} id={p.id} slug={p.slug}
                        name={getLocalizedField(p, "name", locale)}
                        benefit={getLocalizedField(p, "benefit", locale)}
                        price={p.price} stock={p.stock} rating={p.rating} badge={p.badge} locale={locale}
                    />
                ))}
            </div>
        </section>
    );
}
