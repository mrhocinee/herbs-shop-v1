"use client";

import { use, useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";

// ─── Auth Gate ──────────────────────────────────────────────
// Wraps the admin page with a PIN login screen.
// The actual admin dashboard is lazy-loaded after auth.
// ────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";
const AdminDashboardContent = dynamic(() => import("@/components/admin/AdminDashboardContent"), { ssr: false });

export default function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem("hv-admin-auth");
        setAuthed(stored === "true");
        setChecking(false);
    }, []);

    if (checking) return null;

    if (!authed) {
        return <AdminLogin locale={locale} onSuccess={() => setAuthed(true)} />;
    }

    return <AdminDashboardContent locale={locale} />;
}
