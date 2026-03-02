// ─── Product Image Mapping ─────────────────────────────────
// Maps product slugs to image paths in /public/products/
// Falls back to a placeholder emoji if no image exists

const IMAGE_MAP: Record<string, string> = {
    "ginseng-root": "/products/ginseng.png",
    "chrysanthemum-tea": "/products/chrysanthemum.png",
    "astragalus-slices": "/products/astragalus.png",
    "reishi-mushroom": "/products/reishi.png",
    "goji-berries": "/products/ginseng.png",        // reuse until we have unique images
    "jasmine-pearl-tea": "/products/chrysanthemum.png",
    "angelica-sinensis": "/products/astragalus.png",
    "longjing-green-tea": "/products/chrysanthemum.png",
    "licorice-root": "/products/astragalus.png",
    "immunity-blend": "/products/reishi.png",
};

export function getProductImage(slug: string): string | null {
    return IMAGE_MAP[slug] || null;
}

export function getProductImageOrFallback(slug: string): string {
    return IMAGE_MAP[slug] || "/products/ginseng.png";
}
