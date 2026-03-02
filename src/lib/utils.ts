"use client";

import { useState, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format price from centimes to DZD display string */
export function formatPrice(centimes: number, locale: string = "fr"): string {
    const amount = centimes / 100;
    const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} DA`;
}

/** Get localized field from an object with name_ar, name_fr, name_en pattern */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(item: any, field: string, locale: string): string {
    const key = `${field}${locale.charAt(0).toUpperCase() + locale.slice(1)}`;
    return (item[key] as string) ?? (item[`${field}En`] as string) ?? "";
}

/** Slugify a string */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "…";
}

/** 
 * Arabic normalization to handle variations of alef and teh marbuta
 * ensuring search is "forgiving" for Arabic speakers.
 */
export function normalizeArabic(text: string): string {
    return text
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .trim();
}

/**
 * Robust multi-word partial matching for search.
 * Splits query into words and checks if every word exists in the target targets.
 */
export function matchSearch(query: string, targets: (string | undefined | string[])[]): boolean {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    const words = q.split(/\s+/).filter(Boolean);
    const normalizedTargets = targets
        .flat()
        .filter(Boolean)
        .map(t => {
            const low = String(t).toLowerCase();
            return [low, normalizeArabic(low)];
        })
        .flat();

    // Every word in the query must match at least one target partially
    return words.every(word => {
        const normWord = normalizeArabic(word);
        return normalizedTargets.some(target =>
            target.includes(word) || target.includes(normWord)
        );
    });
}

/** Check if a price is a valid safe number */
export function isValidPrice(price: any): price is number {
    return typeof price === 'number' && !isNaN(price) && isFinite(price);
}

/** 
 * React hook to detect if component has mounted.
 * Essential for avoiding hydration mismatches with persistent stores.
 */
export function useHasMounted() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    return hasMounted;
}
