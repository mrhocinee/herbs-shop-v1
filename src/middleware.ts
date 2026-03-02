import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "fr", "ar"];
const defaultLocale = "fr";

function getLocale(request: NextRequest): string {
    // Check if locale is in the pathname
    const { pathname } = request.nextUrl;
    const pathnameLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );
    if (pathnameLocale) return pathnameLocale;

    // Check Accept-Language header
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) {
        const preferred = acceptLang
            .split(",")
            .map((lang) => lang.split(";")[0].trim().substring(0, 2))
            .find((lang) => locales.includes(lang));
        if (preferred) return preferred;
    }

    return defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes, static files, and Next.js internals
    if (
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check if there is a supported locale in the pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return NextResponse.next();

    // Redirect to the locale-prefixed path
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/((?!_next|api|favicon|.*\\..*).*)"],
};
