"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/logistics", icon: Truck, label: "Logistics" },
];

export default function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = use(params);
    const pathname = usePathname();
    const basePath = `/${locale}/admin`;

    return (
        <div className="min-h-screen">
            {/* Top nav bar */}
            <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-white/95 backdrop-blur-xl">
                <div className="flex items-center gap-4 px-6 py-3">
                    <Link
                        href={`/${locale}`}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Shop
                    </Link>

                    <div className="h-4 w-px bg-[var(--border-subtle)]" />

                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--gold-muted)]">
                            <span className="text-xs font-bold text-[var(--gold)]">A</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">Admin</span>
                    </div>

                    <nav className="ms-6 flex items-center gap-1">
                        {navItems.map((item) => {
                            const href = basePath + item.href;
                            const active = item.href === ""
                                ? pathname === basePath
                                : pathname.startsWith(href);
                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                                        active
                                            ? "bg-[var(--jade-light)] text-[var(--jade)]"
                                            : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
                                    )}
                                >
                                    <item.icon
                                        className={cn("h-4 w-4", active && "text-[var(--jade)]")}
                                    />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="p-6 sm:p-8">{children}</main>
        </div>
    );
}
