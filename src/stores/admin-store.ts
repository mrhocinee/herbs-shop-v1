import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, type Product } from "@/lib/demo-data";

// ─── Types ───────────────────────────────────────────────────

interface StockOverride {
    stock: number;
}

interface AdminState {
    products: Product[];
    categories: any[];
    overrides: Record<string, StockOverride>;
    lowStockThreshold: number;
    thresholdOverrides: Record<string, number>;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    setStock: (productId: string, newStock: number) => Promise<void>;
    addStock: (productId: string, amount: number) => Promise<void>;

    // UI Helpers (stays local-ready)
    getStock: (productId: string) => number;
    setLowStockThreshold: (threshold: number) => void;
    setProductThreshold: (productId: string, threshold: number) => void;
    removeProductThreshold: (productId: string) => void;
    getLowStockThreshold: (productId: string) => number;
    isLowStock: (productId: string) => boolean;
    resetToDefault: () => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            products: PRODUCTS,
            categories: [],
            overrides: {},
            lowStockThreshold: 5,
            thresholdOverrides: {},
            isLoading: false,

            initialize: async () => {
                set({ isLoading: true });
                try {
                    const [pRes, cRes] = await Promise.all([
                        fetch("/api/products"),
                        fetch("/api/categories")
                    ]);
                    if (pRes.ok) {
                        const data = await pRes.json();
                        set({ products: sanitizeProducts(data) });
                    }
                    if (cRes.ok) {
                        const data = await cRes.json();
                        set({ categories: data });
                    }
                } catch (e) {
                    console.warn("DB not connected, using demo data", e);
                } finally {
                    set({ isLoading: false });
                }
            },

            addProduct: async (product) => {
                set({ isLoading: true });
                try {
                    const res = await fetch("/api/products", {
                        method: "POST",
                        body: JSON.stringify(product),
                    });
                    if (res.ok) await get().initialize();
                } catch (e) {
                    // Fallback local (demo mode)
                    set((state) => ({ products: [...state.products, product as Product] }));
                } finally {
                    set({ isLoading: false });
                }
            },

            updateProduct: async (product) => {
                // ... same pattern ...
                set((state) => ({
                    products: state.products.map((p) => (p.id === product.id ? product : p)),
                }));
            },

            deleteProduct: async (productId) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== productId),
                }));
            },

            setStock: async (productId, newStock) => {
                set((state) => ({
                    overrides: {
                        ...state.overrides,
                        [productId]: { stock: Math.max(0, newStock) },
                    },
                    products: state.products.map((p) =>
                        p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
                    ),
                }));
            },

            addStock: async (productId, amount) => {
                const current = get().getStock(productId);
                await get().setStock(productId, current + amount);
            },

            resetToDefault: () => {
                if (confirm("Reset all products to default catalog?")) {
                    set({ products: PRODUCTS, overrides: {}, thresholdOverrides: {} });
                }
            },

            getStock: (productId) => {
                const override = get().overrides[productId];
                if (override !== undefined) return override.stock;
                const product = get().products.find((p) => p.id === productId);
                return product?.stock ?? 0;
            },

            setLowStockThreshold: (threshold) => {
                set({ lowStockThreshold: Math.max(1, threshold) });
            },

            setProductThreshold: (productId, threshold) => {
                set((state) => ({
                    thresholdOverrides: {
                        ...state.thresholdOverrides,
                        [productId]: Math.max(1, threshold),
                    },
                }));
            },

            removeProductThreshold: (productId) => {
                set((state) => {
                    const next = { ...state.thresholdOverrides };
                    delete next[productId];
                    return { thresholdOverrides: next };
                });
            },

            getLowStockThreshold: (productId) => {
                const perProduct = get().thresholdOverrides[productId];
                if (perProduct !== undefined) return perProduct;
                return get().lowStockThreshold;
            },

            isLowStock: (productId) => {
                const stock = get().getStock(productId);
                const threshold = get().getLowStockThreshold(productId);
                return stock > 0 && stock <= threshold;
            },
        }),
        {
            name: "herbs-admin-store-v1",
            partialize: (state) => ({
                products: state.products,
                overrides: state.overrides,
                lowStockThreshold: state.lowStockThreshold,
                thresholdOverrides: state.thresholdOverrides,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.products = sanitizeProducts(state.products);
                }
            },
        }
    )
);

/** Helper to filter out corrupted or incomplete product data */
function sanitizeProducts(products: any[]): Product[] {
    if (!Array.isArray(products)) return PRODUCTS;
    return products.filter(p =>
        p &&
        typeof p === 'object' &&
        p.id &&
        p.nameEn &&
        typeof p.price === 'number' &&
        !isNaN(p.price)
    );
}
