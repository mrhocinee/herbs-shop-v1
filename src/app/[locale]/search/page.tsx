"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminStore } from "@/stores/admin-store";
import { CATEGORIES, type Product } from "@/lib/demo-data";
import { getLocalizedField, cn, matchSearch, useHasMounted } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import { Search, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SearchResults({ locale }: { locale: string }) {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const { products } = useAdminStore();
    const hasMounted = useHasMounted();

    // Avoid mismatch between SSR (demo data) and CSR (persistent store)
    if (!hasMounted) {
        return <div className="p-10 text-center text-sm text-[var(--text-muted)]">Loading search...</div>;
    }

    const filtered = products.filter((p: Product) => {
        return matchSearch(query, [p.nameEn, p.nameFr, p.nameAr, p.slug, p.tags]);
    });

    const t: Record<string, any> = {
        en: { title: "Search Results", found: "results found for", none: "No herbs found for", back: "Back to Shop" },
        fr: { title: "Résultats de recherche", found: "résultats trouvés pour", none: "Aucune herbe trouvée pour", back: "Retour à la boutique" },
        ar: { title: "نتائج البحث", found: "نتائج وجدت لـ", none: "لم يتم العثور على أعشاب لـ", back: "العودة إلى المتجر" }
    };
    const s = t[locale] ?? t.en;

    return (
        <div className="px-6 py-8 sm:px-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{s.title}</h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        {filtered.length > 0
                            ? `${filtered.length} ${s.found} "${query}"`
                            : `${s.none} "${query}"`
                        }
                    </p>
                </div>
                <Link
                    href={`/${locale}`}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--jade)] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> {s.back}
                </Link>
            </div>
            {filtered.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((p) => (
                        <ProductCard
                            key={p.id}
                            id={p.id}
                            slug={p.slug}
                            name={getLocalizedField(p, "name", locale)}
                            benefit={getLocalizedField(p, "benefit", locale)}
                            price={p.price}
                            stock={p.stock}
                            badge={p.badge}
                            locale={locale}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--bg-base)]">
                        <Search className="h-10 w-10 text-[var(--text-muted)]" />
                    </div>
                    <p className="max-w-xs text-sm text-[var(--text-muted)]">
                        Try checking your spelling or searching for a more general term.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);

    return (
        <Suspense fallback={<div className="p-10 text-center text-sm text-[var(--text-muted)]">Searching...</div>}>
            <SearchResults locale={locale} />
        </Suspense>
    );
}
