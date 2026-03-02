"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Search,
    Leaf,
    Flower2,
    Beaker,
    Trees,
    Blend,
    Globe,
    Menu,
    X,
    ShieldCheck,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const collections = [
    { slug: "roots", icon: Trees, labelEn: "Roots & Rhizomes", labelFr: "Racines", labelAr: "جذور" },
    { slug: "teas", icon: Leaf, labelEn: "Herbal Teas", labelFr: "Thés", labelAr: "شاي" },
    { slug: "extracts", icon: Beaker, labelEn: "Extracts & Powders", labelFr: "Extraits", labelAr: "مستخلصات" },
    { slug: "flowers", icon: Flower2, labelEn: "Flowers", labelFr: "Fleurs", labelAr: "زهور" },
    { slug: "blends", icon: Blend, labelEn: "TCM Blends", labelFr: "Mélanges", labelAr: "خلطات" },
];

const locales = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "ar", label: "عر" },
];

function getLabel(item: (typeof collections)[0], locale: string) {
    if (locale === "ar") return item.labelAr;
    if (locale === "fr") return item.labelFr;
    return item.labelEn;
}

export default function Sidebar({ locale }: { locale: string }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Added state for search query
    const router = useRouter(); // Initialized useRouter

    // Handler for search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setMobileOpen(false); // Close mobile sidebar after search
        }
    };

    const navContent = (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="border-b border-[var(--border-subtle)] px-5 py-5">
                <Link href={`/${locale}`} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--jade-light)]">
                        <span className="text-lg font-bold text-[var(--jade)]">草</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-[var(--text-primary)]">HerbVault</h1>
                        <p className="text-[10px] text-[var(--text-muted)]">中药 • Herbes Médicinales</p>
                    </div>
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="px-3 pt-4">
                <div className="relative group">
                    <button
                        type="submit"
                        className="absolute inset-y-0 start-0 flex items-center ps-3 z-20 group"
                    >
                        <Search className="h-4 w-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--jade)] group-focus-within:text-[var(--jade)]" />
                    </button>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={locale === "ar" ? "بحث..." : locale === "fr" ? "Rechercher..." : "Search..."}
                        className="relative z-10 w-full cursor-text rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] py-2.5 pe-4 ps-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:bg-white focus:border-[var(--jade)] focus:outline-none focus:ring-1 focus:ring-[var(--jade)]/20 shadow-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center z-20">
                        <kbd className="hidden sm:inline-block rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] transition-opacity group-focus-within:opacity-0 font-sans">↵</kbd>
                    </div>
                </div>
            </form>

            {/* Home */}
            <nav className="mt-4 space-y-1 px-3">
                <Link
                    href={`/${locale}`}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        pathname === `/${locale}`
                            ? "bg-[var(--jade-light)] text-[var(--jade)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                >
                    <Home className={cn("h-4 w-4", pathname === `/${locale}` && "text-[var(--jade)]")} />
                    {locale === "ar" ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home"}
                </Link>
                <Link
                    href={`/${locale}/track`}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        pathname.includes("/track")
                            ? "bg-[var(--jade-light)] text-[var(--jade)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                >
                    <Package className={cn("h-4 w-4", pathname.includes("/track") && "text-[var(--jade)]")} />
                    {locale === "ar" ? "تتبع الطلب" : locale === "fr" ? "Suivre commande" : "Track Order"}
                </Link>
            </nav>

            {/* Collections */}
            <div className="mt-6 px-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    {locale === "ar" ? "المجموعات" : locale === "fr" ? "Collections" : "Collections"}
                </p>
            </div>
            <nav className="space-y-0.5 px-3">
                {collections.map((col) => {
                    const href = `/${locale}/category/${col.slug}`;
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={col.slug}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                                active
                                    ? "bg-[var(--jade-light)] text-[var(--jade)]"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                            )}
                        >
                            <col.icon className={cn("h-4 w-4", active && "text-[var(--jade)]")} />
                            {getLabel(col, locale)}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex-1" />

            {/* Bottom */}
            <div className="border-t border-[var(--border-subtle)] p-3 space-y-1">
                <div className="flex items-center gap-1 px-3 py-2">
                    <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                    {locales.map((loc) => (
                        <Link
                            key={loc.code}
                            href={pathname.replace(`/${locale}`, `/${loc.code}`)}
                            className={cn(
                                "rounded-lg px-2 py-1 text-xs transition-colors",
                                locale === loc.code
                                    ? "bg-[var(--jade-light)] text-[var(--jade)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            )}
                        >
                            {loc.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed start-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md text-[var(--text-secondary)] md:hidden"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            <aside className="fixed inset-y-0 start-0 z-40 hidden w-[280px] border-e border-[var(--border-subtle)] bg-white md:block">
                {navContent}
            </aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-black/30 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: locale === "ar" ? 280 : -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: locale === "ar" ? 280 : -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 start-0 z-50 w-[280px] bg-white shadow-xl md:hidden"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute end-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)]"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            {navContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
