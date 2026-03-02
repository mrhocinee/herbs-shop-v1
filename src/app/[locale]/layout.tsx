import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import Sidebar from "@/components/layout/Sidebar";
import CartBar from "@/components/layout/CartBar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HerbVault — Chinese Medical Herbs",
    description:
        "Premium Chinese medical herbs delivered across Algeria. أعشاب طبية صينية",
};

export function generateStaticParams() {
    return [{ locale: "en" }, { locale: "fr" }, { locale: "ar" }];
}

import StoreInitializer from "@/components/layout/StoreInitializer";

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dir = locale === "ar" ? "rtl" : "ltr";
    const lang = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en";

    return (
        <html lang={lang} dir={dir}>
            <body
                className={`${geist.className} min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] antialiased`}
                style={{ "--sidebar-width": "280px" } as React.CSSProperties}
            >
                <StoreInitializer />
                <Sidebar locale={locale} />
                <main className="min-h-screen pb-24 transition-all duration-300 md:ms-[280px]">
                    {children}
                </main>
                <CartBar />
                <WhatsAppButton locale={locale} />
            </body>
        </html>
    );
}
