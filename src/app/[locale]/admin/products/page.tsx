"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Package, Save, Check, RefreshCw } from "lucide-react";
import { CATEGORIES, type Product } from "@/lib/demo-data";
import { formatPrice, getLocalizedField, cn, slugify, matchSearch } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";

const emptyProduct: Product = {
    id: "", slug: "", categoryId: "c1",
    nameEn: "", nameFr: "", nameAr: "",
    descEn: "", descFr: "", descAr: "",
    benefitEn: "", benefitFr: "", benefitAr: "",
    price: 0, stock: 0, rating: 0,
    ingredientsEn: "", ingredientsFr: "", ingredientsAr: "",
    usageEn: "", usageFr: "", usageAr: "",
    warningsEn: "", warningsFr: "", warningsAr: "",
    origin: "",
};

export default function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const [mounted, setMounted] = useState(false);

    // Search & Filters
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");

    // Modal State
    const [editing, setEditing] = useState<Product | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Stock/Add state
    const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});
    const [justRestocked, setJustRestocked] = useState<Record<string, number>>({});

    const {
        products, addProduct, updateProduct, deleteProduct,
        getStock, setStock, isLowStock, initialize, isLoading
    } = useAdminStore();

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    // Explicitly compute filtered products on every render
    const filtered = products.filter((p) => {
        const nameMatch = matchSearch(search, [p.nameEn, p.nameFr, p.nameAr, p.slug, p.tags]);
        const catMatch = catFilter === "all" || p.categoryId === catFilter;
        return nameMatch && catMatch;
    });

    const openCreate = () => {
        setEditing({ ...emptyProduct, id: `p-${Date.now()}` });
        setModalOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditing({ ...p, stock: getStock(p.id) });
        setModalOpen(true);
    };

    const closeModal = () => {
        setEditing(null);
        setModalOpen(false);
    };

    const handleSave = async () => {
        if (!editing) return;
        const p = { ...editing, slug: editing.slug || slugify(editing.nameEn) };

        // Sync products list
        const exists = products.find(x => x.id === p.id);
        if (exists) {
            await updateProduct(p);
        } else {
            await addProduct(p);
        }

        // Persist stock explicitly
        await setStock(p.id, p.stock);

        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this product?")) await deleteProduct(id);
    };

    const handleQuickRestock = async (productId: string) => {
        const amount = restockAmounts[productId] || 10;
        const current = getStock(productId);
        await setStock(productId, current + amount);

        setJustRestocked((prev) => ({ ...prev, [productId]: amount }));
        setTimeout(() => {
            setJustRestocked((prev) => { const next = { ...prev }; delete next[productId]; return next; });
        }, 2000);
        setRestockAmounts((prev) => { const next = { ...prev }; delete next[productId]; return next; });
    };

    const updateField = (field: keyof Product, value: string | number) => {
        if (!editing) return;
        setEditing({ ...editing, [field]: value });
    };

    if (!mounted) return null;

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span>{products.length} herbs in catalog</span>
                        {search && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-[var(--border-default)]" />
                                <span className="text-[var(--jade)] font-medium">{filtered.length} results for "{search}"</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={useAdminStore.getState().resetToDefault}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)]"
                    >
                        <RefreshCw className="h-4 w-4" /> Reset
                    </button>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--jade)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--jade-hover)] shadow-md shadow-[var(--jade)]/10"
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 z-20">
                        <Search className="h-4 w-4 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--jade)]" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search herbs..."
                        className="relative z-10 w-full cursor-text rounded-xl border border-[var(--border-default)] bg-white py-2.5 pe-10 ps-10 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--jade)] focus:outline-none focus:ring-1 focus:ring-[var(--jade)]/20 shadow-sm"
                    />
                    {search && (
                        <div className="absolute inset-y-0 end-0 flex items-center pe-3 z-20">
                            <button
                                onClick={() => setSearch("")}
                                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button onClick={() => setCatFilter("all")} className={cn("rounded-lg px-3 py-1.5 text-xs whitespace-nowrap", catFilter === "all" ? "bg-[var(--jade-light)] text-[var(--jade)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}>All</button>
                    {CATEGORIES.map((c) => (
                        <button key={c.id} onClick={() => setCatFilter(c.id)} className={cn("rounded-lg px-3 py-1.5 text-xs whitespace-nowrap", catFilter === c.id ? "bg-[var(--jade-light)] text-[var(--jade)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]")}>{c.nameEn}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/50">
                            <th className="px-5 py-3 text-start text-xs font-semibold text-[var(--text-muted)]">Product</th>
                            <th className="px-5 py-3 text-start text-xs font-semibold text-[var(--text-muted)]">Category</th>
                            <th className="px-5 py-3 text-end text-xs font-semibold text-[var(--text-muted)]">Price</th>
                            <th className="px-5 py-3 text-end text-xs font-semibold text-[var(--text-muted)]">Stock</th>
                            <th className="px-5 py-3 text-end text-xs font-semibold text-[var(--text-muted)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filtered.map((p) => {
                            const cat = CATEGORIES.find((c) => c.id === p.categoryId);
                            const st = getStock(p.id);
                            const restocked = justRestocked[p.id];

                            return (
                                <tr key={p.id} className="transition-colors hover:bg-[var(--bg-base)]/30">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--jade-light)]"><span className="text-sm">🌿</span></div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{getLocalizedField(p, "name", locale)}</p>
                                                {p.badge && <span className={cn("text-[10px] uppercase tracking-wider font-bold",
                                                    p.badge === "new" ? "text-[var(--jade)]" :
                                                        p.badge === "bestseller" ? "text-[var(--gold)]" : "text-[var(--error)]")}>{p.badge}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[var(--text-secondary)]">{cat ? cat.nameEn : "—"}</td>
                                    <td className="px-5 py-4 text-end font-mono text-[var(--gold)] font-medium">{formatPrice(p.price)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={cn("inline-flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 font-mono text-sm font-bold",
                                                st === 0 ? "text-[var(--error)]" :
                                                    isLowStock(p.id) ? "text-[var(--warning)]" : "text-[var(--jade)]")}>
                                                {st}
                                            </span>
                                            {restocked !== undefined ? (
                                                <span className="text-[11px] font-semibold text-[var(--jade)]">+{restocked} ✓</span>
                                            ) : (
                                                <>
                                                    <input type="number" min="1" value={restockAmounts[p.id] ?? 10}
                                                        onChange={(e) => setRestockAmounts((prev) => ({ ...prev, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                                        className="h-7 w-12 rounded-md border border-[var(--border-default)] bg-white px-1 text-center font-mono text-[11px] text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none" />
                                                    <button onClick={() => handleQuickRestock(p.id)}
                                                        className="flex h-7 items-center gap-0.5 rounded-md bg-[var(--jade)] px-2 text-[11px] font-semibold text-white hover:bg-[var(--jade-hover)]">
                                                        <Plus className="h-3 w-3" /> Add
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-end">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--jade)] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--error-muted)] hover:text-[var(--error)] transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-[var(--text-muted)]">
                                    <div className="flex flex-col items-center">
                                        <Search className="mb-3 h-10 w-10 opacity-20" />
                                        <p className="text-sm">No herbs found matching "{search}"</p>
                                        <button onClick={() => setSearch("")} className="mt-2 text-xs text-[var(--jade)] hover:underline">Clear search</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {modalOpen && editing && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 z-50 m-auto max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border-default)] bg-white p-8 shadow-2xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    {products.some((p) => p.id === editing.id) ? "Edit Product" : "New Product"}
                                </h2>
                                <button onClick={closeModal} className="rounded-full p-2 hover:bg-[var(--bg-elevated)] transition-colors"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Names */}
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/30 p-4 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--jade)]">Product Identity</h3>
                                    <FormField label="English Name" value={editing.nameEn} onChange={(v) => updateField("nameEn", v)} placeholder="Ginseng Root" />
                                    <FormField label="Français" value={editing.nameFr} onChange={(v) => updateField("nameFr", v)} placeholder="Racine de Ginseng" />
                                    <FormField label="العربية" value={editing.nameAr} onChange={(v) => updateField("nameAr", v)} placeholder="جذر الجنسنج" dir="rtl" />
                                </div>

                                {/* Category, Price, Stock */}
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Category</label>
                                        <select value={editing.categoryId} onChange={(e) => updateField("categoryId", e.target.value)}
                                            className="w-full rounded-xl border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none">
                                            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                                        </select>
                                    </div>
                                    <FormField label="Price (centimes)" value={editing.price.toString()} onChange={(v) => updateField("price", parseInt(v) || 0)} type="number" placeholder="450000" />
                                    <FormField label="Stock" value={editing.stock.toString()} onChange={(v) => updateField("stock", parseInt(v) || 0)} type="number" placeholder="24" />
                                </div>

                                {/* Badge & Rating */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Badge</label>
                                        <select value={editing.badge || ""} onChange={(e) => updateField("badge", e.target.value as any)}
                                            className="w-full rounded-xl border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none">
                                            <option value="">None</option>
                                            <option value="new">New</option>
                                            <option value="bestseller">Best Seller</option>
                                            <option value="limited">Limited Edition</option>
                                        </select>
                                    </div>
                                    <FormField label="Rating" value={editing.rating.toString()} onChange={(v) => updateField("rating", parseFloat(v) || 0)} type="number" placeholder="4.8" />
                                </div>

                                {/* Descriptions */}
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/30 p-4 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--jade)]">Product Description</h3>
                                    <FormArea label="English" value={editing.descEn} onChange={(v) => updateField("descEn", v)} />
                                    <FormArea label="Français" value={editing.descFr} onChange={(v) => updateField("descFr", v)} />
                                    <FormArea label="العربية" value={editing.descAr} onChange={(v) => updateField("descAr", v)} dir="rtl" />
                                </div>

                                {/* Benefits */}
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/30 p-4 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--jade)]">Key Benefit</h3>
                                    <FormField label="English" value={editing.benefitEn} onChange={(v) => updateField("benefitEn", v)} placeholder="Energy & vitality" />
                                    <FormField label="Français" value={editing.benefitFr} onChange={(v) => updateField("benefitFr", v)} placeholder="Énergie & vitalité" />
                                    <FormField label="العربية" value={editing.benefitAr} onChange={(v) => updateField("benefitAr", v)} placeholder="طاقة وحيوية" dir="rtl" />
                                </div>

                                {/* Origin */}
                                <FormField label="Origin" value={editing.origin || ""} onChange={(v) => updateField("origin", v)} placeholder="Geumsan, South Korea" />

                                {/* Save Button */}
                                <button
                                    onClick={handleSave}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--jade)] py-4 text-sm font-bold text-white hover:bg-[var(--jade-hover)] shadow-xl shadow-[var(--jade)]/20 transition-all hover:-translate-y-0.5"
                                >
                                    <Save className="h-5 w-5" />
                                    {products.some((p) => p.id === editing.id) ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function FormField({ label, value, onChange, placeholder, type = "text", dir }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; dir?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir}
                className="w-full rounded-xl border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none transition-colors" />
        </div>
    );
}

function FormArea({ label, value, onChange, dir }: {
    label: string; value: string; onChange: (v: string) => void; dir?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</label>
            <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} dir={dir}
                className="w-full rounded-xl border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] focus:border-[var(--jade)] focus:outline-none transition-colors resize-none" />
        </div>
    );
}
