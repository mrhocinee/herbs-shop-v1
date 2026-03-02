"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/stores/admin-store";

export default function StoreInitializer() {
    const initialize = useAdminStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return null;
}
