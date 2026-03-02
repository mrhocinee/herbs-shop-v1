"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";

interface TrackedOrder {
    id: string;
    orderNumber: number;
    status: string;
    total: number;
    shippingFee: number;
    wilaya: string;
    items: { name: string; qty: number; price: number }[];
    createdAt: string;
    confirmedAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
}

const STATUS_STEPS = [
    { key: "pending", en: "Order Placed", fr: "Commande passée", ar: "تم الطلب", icon: "📝" },
    { key: "confirmed", en: "Confirmed", fr: "Confirmée", ar: "مؤكد", icon: "✅" },
    { key: "shipping", en: "Shipping", fr: "En livraison", ar: "قيد التوصيل", icon: "🚚" },
    { key: "delivered", en: "Delivered", fr: "Livrée", ar: "تم التسليم", icon: "📦" },
];

export default function TrackPage({ params }: { params: Promise<{ locale: string }> }) {
    const [locale, setLocale] = useState("en");
    const [query, setQuery] = useState("");
    const [orders, setOrders] = useState<TrackedOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        params.then(p => setLocale(p.locale));
    }, [params]);

    const formatPrice = (centimes: number) => {
        const amount = centimes / 100;
        return new Intl.NumberFormat("fr-DZ", { minimumFractionDigits: 2 }).format(amount) + " DA";
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);

        const isOrderNum = /^\d+$/.test(query.trim());
        const param = isOrderNum ? `order=${query.trim()}` : `phone=${query.trim()}`;

        try {
            const res = await fetch(`/api/orders/track?${param}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        const idx = STATUS_STEPS.findIndex(s => s.key === status);
        return idx >= 0 ? idx : 0;
    };

    const labels = {
        en: { title: "Track Your Order", subtitle: "Enter your phone number or order number to check status", placeholder: "Phone or order #", btn: "Track", noResults: "No orders found", tryAgain: "Try a different phone number or order #" },
        fr: { title: "Suivre votre commande", subtitle: "Entrez votre numéro de téléphone ou de commande", placeholder: "Téléphone ou # commande", btn: "Suivre", noResults: "Aucune commande trouvée", tryAgain: "Essayez un autre numéro de téléphone ou de commande" },
        ar: { title: "تتبع طلبك", subtitle: "أدخل رقم هاتفك أو رقم الطلب للتحقق من الحالة", placeholder: "هاتف أو رقم الطلب", btn: "تتبع", noResults: "لم يتم العثور على طلبات", tryAgain: "جرّب رقم هاتف أو طلب آخر" },
    };

    const l = labels[locale as keyof typeof labels] || labels.en;

    return (
        <div style={{ minHeight: "80vh", padding: "2rem 1rem", maxWidth: 700, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    {l.title}
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{l.subtitle}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={l.placeholder}
                    style={{
                        flex: 1, padding: "0.75rem 1rem", borderRadius: "12px",
                        border: "1px solid var(--border-default)", background: "var(--bg-raised)",
                        fontSize: "1rem", color: "var(--text-primary)", outline: "none",
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.5rem", borderRadius: "12px",
                        background: "var(--jade)", color: "white", border: "none",
                        fontWeight: 600, cursor: "pointer", fontSize: "0.95rem",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? "..." : l.btn}
                </button>
            </form>

            {/* Results */}
            {searched && orders.length === 0 && !loading && (
                <div style={{
                    textAlign: "center", padding: "3rem 1rem",
                    background: "var(--bg-raised)", borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>🔍</div>
                    <h3 style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{l.noResults}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{l.tryAgain}</p>
                </div>
            )}

            {orders.map(order => {
                const currentStep = getStatusIndex(order.status);

                return (
                    <div
                        key={order.id}
                        style={{
                            background: "var(--bg-raised)", borderRadius: "16px",
                            border: "1px solid var(--border-subtle)", padding: "1.5rem",
                            marginBottom: "1rem",
                        }}
                    >
                        {/* Order header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                                    {locale === "ar" ? "طلب" : locale === "fr" ? "Commande" : "Order"} #{order.orderNumber}
                                </div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                    {formatPrice(order.total)}
                                </div>
                            </div>
                            <div style={{
                                padding: "0.35rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem",
                                fontWeight: 600, textTransform: "capitalize",
                                background: order.status === "delivered" ? "rgba(74,124,89,0.12)" :
                                    order.status === "shipping" ? "rgba(74,124,155,0.12)" :
                                        order.status === "confirmed" ? "rgba(74,124,89,0.08)" : "rgba(192,139,44,0.12)",
                                color: order.status === "delivered" ? "#3D6A4B" :
                                    order.status === "shipping" ? "#4A7C9B" :
                                        order.status === "confirmed" ? "#4A7C59" : "#C08B2C",
                            }}>
                                {order.status}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem" }}>
                            {STATUS_STEPS.map((step, i) => (
                                <div key={step.key} style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{
                                        height: 4, borderRadius: 2, marginBottom: "0.5rem",
                                        background: i <= currentStep ? "var(--jade)" : "var(--border-default)",
                                        transition: "background 0.3s",
                                    }} />
                                    <div style={{ fontSize: "1rem" }}>{step.icon}</div>
                                    <div style={{
                                        fontSize: "0.65rem", color: i <= currentStep ? "var(--jade)" : "var(--text-muted)",
                                        fontWeight: i === currentStep ? 600 : 400, marginTop: 2,
                                    }}>
                                        {step[locale as "en" | "fr" | "ar"] || step.en}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        <div style={{
                            borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem",
                        }}>
                            {order.items.map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between",
                                    padding: "0.35rem 0", fontSize: "0.85rem",
                                }}>
                                    <span style={{ color: "var(--text-secondary)" }}>{item.name} × {item.qty}</span>
                                    <span style={{ color: "var(--text-primary)", fontWeight: 500, fontFamily: "monospace" }}>
                                        {formatPrice(item.price * item.qty)}
                                    </span>
                                </div>
                            ))}
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem",
                                marginTop: "0.5rem", fontSize: "0.8rem",
                            }}>
                                <span style={{ color: "var(--text-muted)" }}>
                                    {locale === "ar" ? "التوصيل" : locale === "fr" ? "Livraison" : "Shipping"} • {order.wilaya}
                                </span>
                                <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>
                                    {formatPrice(order.shippingFee)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Demo hint */}
            {!searched && (
                <div style={{
                    textAlign: "center", marginTop: "1rem", padding: "1rem",
                    background: "var(--jade-muted)", borderRadius: "12px",
                }}>
                    <p style={{ color: "var(--jade)", fontSize: "0.8rem" }}>
                        💡 {locale === "ar" ? "جرّب: 0551234567 أو 1001" : locale === "fr" ? "Essayez : 0551234567 ou 1001" : "Try: 0551234567 or 1001"}
                    </p>
                </div>
            )}
        </div>
    );
}
