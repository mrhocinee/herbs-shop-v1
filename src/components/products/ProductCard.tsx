"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star, Eye } from "lucide-react";
import { cn, formatPrice, useHasMounted } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useAdminStore } from "@/stores/admin-store";
import { getProductImage } from "@/lib/product-images";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const badgeStyles = {
    new: "bg-[var(--jade-light)] text-[var(--jade)]",
    bestseller: "bg-[var(--gold-muted)] text-[var(--gold)]",
    limited: "bg-[var(--error-muted)] text-[var(--error)]",
};

const badgeLabels = {
    new: "New",
    bestseller: "Best Seller",
    limited: "Limited",
};

interface ProductCardProps {
    id: string;
    slug: string;
    name: string;
    description?: string;
    benefit?: string;
    price: number;
    stock: number;
    rating?: number;
    category?: string;
    badge?: "new" | "bestseller" | "limited" | null;
    locale?: string;
}

export default function ProductCard({
    id, slug, name, description, benefit, price, stock: staticStock, rating, category, badge, locale = "fr",
}: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const { getStock } = useAdminStore();
    const stock = getStock(id);
    const hasMounted = useHasMounted();
    const [justAdded, setJustAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({ productId: id, slug, name, price, maxStock: stock });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 600);
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white transition-all duration-200",
                "hover:shadow-lg hover:shadow-black/[0.06] hover:border-[var(--border-hover)]",
                justAdded && "animate-jade-ring"
            )}
        >
            <Link href={`/${locale}/product/${slug}`}>
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden">
                    {getProductImage(slug) ? (
                        <Image
                            src={getProductImage(slug)!}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    ) : (
                        <span className="text-5xl opacity-40">🌿</span>
                    )}

                    {badge && (
                        <span className={cn(
                            "absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            badgeStyles[badge]
                        )}>
                            {badgeLabels[badge]}
                        </span>
                    )}

                    {hasMounted && stock > 0 && stock <= 5 && (
                        <span className="absolute end-3 top-3 rounded-full bg-[var(--error-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--error)]">
                            {stock} left
                        </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAdd}
                            disabled={stock === 0}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--jade)] text-white shadow-lg disabled:opacity-50"
                            aria-label="Add to cart"
                        >
                            <ShoppingBag className="h-4 w-4" />
                        </motion.button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[var(--text-primary)] shadow-lg">
                            <Eye className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {category && (
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[var(--jade)]">
                            {category}
                        </p>
                    )}

                    <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
                        {name}
                    </h3>

                    {benefit && (
                        <p className="mb-3 text-xs text-[var(--text-muted)] line-clamp-1">{benefit}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-[var(--gold)]">
                            {formatPrice(price)}
                        </span>

                        {rating && (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {rating}
                            </span>
                        )}
                    </div>

                    {hasMounted && stock === 0 && (
                        <p className="mt-2 text-xs font-medium text-[var(--error)]">Out of stock</p>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
