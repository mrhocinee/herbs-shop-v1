"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PIN = "herbvault2026"; // Change this or move to env var

export default function AdminLogin({ locale, onSuccess }: { locale: string, onSuccess?: () => void }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const router = useRouter();

    // Check if already authenticated
    useEffect(() => {
        const stored = sessionStorage.getItem("hv-admin-auth");
        if (stored === "true") {
            router.replace(`/${locale}/admin/dashboard`);
        }
    }, [locale, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            sessionStorage.setItem("hv-admin-auth", "true");
            if (onSuccess) onSuccess();
            router.replace(`/${locale}/admin/dashboard`);
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setTimeout(() => setError(false), 3000);
        }
    };

    const labels = {
        en: { title: "Admin Access", subtitle: "Enter your admin PIN to continue", placeholder: "Enter PIN", btn: "Login", error: "Incorrect PIN" },
        fr: { title: "Accès Admin", subtitle: "Entrez votre PIN administrateur", placeholder: "Entrer le PIN", btn: "Connexion", error: "PIN incorrect" },
        ar: { title: "دخول المسؤول", subtitle: "أدخل رمز PIN الخاص بالمسؤول", placeholder: "أدخل PIN", btn: "تسجيل الدخول", error: "PIN غير صحيح" },
    };
    const l = labels[locale as keyof typeof labels] || labels.en;

    return (
        <div style={{
            minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
        }}>
            <div style={{
                maxWidth: 360, width: "100%", textAlign: "center",
            }}>
                {/* Logo */}
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: "var(--jade-light)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem",
                }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: "var(--jade)" }}>草</span>
                </div>

                <h1 style={{
                    fontSize: "1.5rem", fontWeight: 700,
                    color: "var(--text-primary)", marginBottom: "0.25rem",
                }}>{l.title}</h1>
                <p style={{
                    color: "var(--text-muted)", fontSize: "0.85rem",
                    marginBottom: "2rem",
                }}>{l.subtitle}</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={pin}
                        onChange={e => { setPin(e.target.value); setError(false); }}
                        placeholder={l.placeholder}
                        autoFocus
                        style={{
                            width: "100%", padding: "0.85rem 1rem",
                            borderRadius: 12, fontSize: "1rem", textAlign: "center",
                            letterSpacing: 4, fontFamily: "monospace",
                            border: `2px solid ${error ? "var(--error)" : "var(--border-default)"}`,
                            background: "var(--bg-raised)", color: "var(--text-primary)",
                            outline: "none", transition: "border-color 0.2s",
                            animation: shake ? "shake 0.5s" : "none",
                        }}
                    />

                    {error && (
                        <p style={{
                            color: "var(--error)", fontSize: "0.8rem",
                            marginTop: "0.5rem", fontWeight: 500,
                        }}>⚠️ {l.error}</p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: "100%", padding: "0.85rem",
                            borderRadius: 12, marginTop: "1rem",
                            background: "var(--jade)", color: "white",
                            border: "none", fontWeight: 600,
                            fontSize: "0.95rem", cursor: "pointer",
                        }}
                    >
                        {l.btn}
                    </button>
                </form>

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-8px); }
                        40% { transform: translateX(8px); }
                        60% { transform: translateX(-4px); }
                        80% { transform: translateX(4px); }
                    }
                `}</style>
            </div>
        </div>
    );
}
