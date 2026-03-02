import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

export interface CartItem {
    productId: string;
    slug: string;
    name: string; // Localized name (set at add-time)
    price: number; // Centimes DZD
    quantity: number;
    image?: string;
    maxStock: number;
}

interface CartState {
    items: CartItem[];
    lastAddedItem: CartItem | null;

    // Actions
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clear: () => void;

    // Computed (using getters via selectors)
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// ─── Store ───────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            lastAddedItem: null,

            addItem: (newItem) => {
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.productId === newItem.productId
                    );

                    if (existing) {
                        const updatedQuantity = Math.min(
                            existing.quantity + (newItem.quantity ?? 1),
                            existing.maxStock
                        );
                        const updatedItem = { ...existing, quantity: updatedQuantity };
                        return {
                            items: state.items.map((i) =>
                                i.productId === newItem.productId ? updatedItem : i
                            ),
                            lastAddedItem: updatedItem,
                        };
                    }

                    const item: CartItem = {
                        ...newItem,
                        quantity: newItem.quantity ?? 1,
                    };
                    return {
                        items: [...state.items, item],
                        lastAddedItem: item,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                    lastAddedItem:
                        state.lastAddedItem?.productId === productId
                            ? null
                            : state.lastAddedItem,
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter((i) => i.productId !== productId),
                        };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.productId === productId
                                ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                                : i
                        ),
                    };
                });
            },

            clear: () => set({ items: [], lastAddedItem: null }),

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: "herbs-cart",
            // Only persist items, not transient state
            partialize: (state) => ({
                items: state.items,
            }),
        }
    )
);
