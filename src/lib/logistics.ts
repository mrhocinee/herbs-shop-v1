/**
 * Logistics Engine — Order Sorting & Delivery Manifest Generator
 *
 * Groups pending COD orders by shipment zone for optimized delivery routing.
 * Designed for Algeria's 58 wilayas grouped into delivery regions.
 */

// ─── Types ───────────────────────────────────────────────────

export interface OrderForLogistics {
    id: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    wilaya: string;
    commune: string;
    street: string;
    totalAmount: number; // Centimes DZD (includes shipping)
    shippingFee: number;
    itemCount: number;
    notes?: string;
    createdAt: Date;
    status: "pending" | "confirmed" | "out_for_delivery";
}

export interface ShipmentZone {
    id: number;
    zoneName: string;
    zoneNameAr?: string;
    zoneNameFr?: string;
    wilayas: string[];
    baseFee: number;
    estimatedDays: number;
}

export interface ZoneGroup {
    zone: ShipmentZone;
    orders: OrderForLogistics[];
    totalCodAmount: number;
    totalShippingFees: number;
    orderCount: number;
}

export interface DeliveryManifest {
    zone: ShipmentZone;
    generatedAt: Date;
    driverName?: string;
    entries: ManifestEntry[];
    summary: ManifestSummary;
}

export interface ManifestEntry {
    sequence: number;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    wilaya: string;
    commune: string;
    street: string;
    codAmount: number; // Amount to collect
    itemCount: number;
    notes?: string;
}

export interface ManifestSummary {
    totalOrders: number;
    totalCodToCollect: number;
    totalShippingFees: number;
    communeBreakdown: Record<string, number>; // commune → order count
}

export interface ZoneStats {
    zoneName: string;
    zoneNameAr?: string;
    zoneNameFr?: string;
    pendingOrders: number;
    confirmedOrders: number;
    outForDeliveryOrders: number;
    totalCodAmount: number;
    estimatedDays: number;
}

// ─── Core Algorithm: Group Orders by Zone ────────────────────

/**
 * Groups orders by their shipment zone based on wilaya.
 * Orders whose wilaya doesn't match any zone are placed in an "Unassigned" group.
 */
export function groupOrdersByZone(
    orders: OrderForLogistics[],
    zones: ShipmentZone[]
): ZoneGroup[] {
    // Build a wilaya → zone lookup map
    const wilayaToZone = new Map<string, ShipmentZone>();
    for (const zone of zones) {
        for (const wilaya of zone.wilayas) {
            wilayaToZone.set(wilaya.toLowerCase().trim(), zone);
        }
    }

    // Group orders into zones
    const zoneGroupMap = new Map<number, ZoneGroup>();

    // Create a fallback "Unassigned" zone
    const unassignedZone: ShipmentZone = {
        id: -1,
        zoneName: "Unassigned",
        zoneNameAr: "غير مصنف",
        zoneNameFr: "Non assigné",
        wilayas: [],
        baseFee: 0,
        estimatedDays: 0,
    };

    for (const order of orders) {
        const zone =
            wilayaToZone.get(order.wilaya.toLowerCase().trim()) ?? unassignedZone;

        const existing = zoneGroupMap.get(zone.id);
        if (existing) {
            existing.orders.push(order);
            existing.totalCodAmount += order.totalAmount;
            existing.totalShippingFees += order.shippingFee;
            existing.orderCount += 1;
        } else {
            zoneGroupMap.set(zone.id, {
                zone,
                orders: [order],
                totalCodAmount: order.totalAmount,
                totalShippingFees: order.shippingFee,
                orderCount: 1,
            });
        }
    }

    // Sort groups: most orders first, unassigned last
    const groups = Array.from(zoneGroupMap.values());
    groups.sort((a, b) => {
        if (a.zone.id === -1) return 1;
        if (b.zone.id === -1) return -1;
        return b.orderCount - a.orderCount;
    });

    // Within each group, sort orders by commune then by creation date
    for (const group of groups) {
        group.orders.sort((a, b) => {
            const communeCompare = a.commune.localeCompare(b.commune, "fr");
            if (communeCompare !== 0) return communeCompare;
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    return groups;
}

// ─── Generate Delivery Manifest ──────────────────────────────

/**
 * Creates a printable delivery manifest for a specific zone's orders.
 * Orders are sequenced by commune (clustered for efficient routing).
 */
export function generateDeliveryManifest(
    zone: ShipmentZone,
    orders: OrderForLogistics[],
    driverName?: string
): DeliveryManifest {
    // Sort by commune, then by creation date within each commune
    const sorted = [...orders].sort((a, b) => {
        const communeCompare = a.commune.localeCompare(b.commune, "fr");
        if (communeCompare !== 0) return communeCompare;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const communeBreakdown: Record<string, number> = {};
    const entries: ManifestEntry[] = sorted.map((order, idx) => {
        // Track commune counts
        communeBreakdown[order.commune] =
            (communeBreakdown[order.commune] ?? 0) + 1;

        return {
            sequence: idx + 1,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            wilaya: order.wilaya,
            commune: order.commune,
            street: order.street,
            codAmount: order.totalAmount,
            itemCount: order.itemCount,
            notes: order.notes,
        };
    });

    const totalCodToCollect = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalShippingFees = orders.reduce((sum, o) => sum + o.shippingFee, 0);

    return {
        zone,
        generatedAt: new Date(),
        driverName,
        entries,
        summary: {
            totalOrders: orders.length,
            totalCodToCollect,
            totalShippingFees,
            communeBreakdown,
        },
    };
}

// ─── Zone Statistics (for Dashboard) ─────────────────────────

/**
 * Calculates aggregate statistics per zone for the admin dashboard.
 */
export function getZoneStats(
    orders: OrderForLogistics[],
    zones: ShipmentZone[]
): ZoneStats[] {
    const groups = groupOrdersByZone(orders, zones);

    return groups
        .filter((g) => g.zone.id !== -1) // Exclude unassigned
        .map((group) => {
            const pending = group.orders.filter(
                (o) => o.status === "pending"
            ).length;
            const confirmed = group.orders.filter(
                (o) => o.status === "confirmed"
            ).length;
            const outForDelivery = group.orders.filter(
                (o) => o.status === "out_for_delivery"
            ).length;

            return {
                zoneName: group.zone.zoneName,
                zoneNameAr: group.zone.zoneNameAr,
                zoneNameFr: group.zone.zoneNameFr,
                pendingOrders: pending,
                confirmedOrders: confirmed,
                outForDeliveryOrders: outForDelivery,
                totalCodAmount: group.totalCodAmount,
                estimatedDays: group.zone.estimatedDays,
            };
        });
}

// ─── Algeria's Default Shipment Zones ────────────────────────

export const DEFAULT_ALGERIA_ZONES: Omit<ShipmentZone, "id">[] = [
    {
        zoneName: "Algiers Metro",
        zoneNameAr: "العاصمة والضواحي",
        zoneNameFr: "Alger Métropole",
        wilayas: ["Alger", "Blida", "Tipaza", "Boumerdès"],
        baseFee: 40000, // 400 DZD
        estimatedDays: 1,
    },
    {
        zoneName: "Central",
        zoneNameAr: "الوسط",
        zoneNameFr: "Centre",
        wilayas: [
            "Médéa",
            "Bouira",
            "Tizi Ouzou",
            "Béjaïa",
            "Chlef",
            "Aïn Defla",
            "Djelfa",
            "M'sila",
        ],
        baseFee: 60000, // 600 DZD
        estimatedDays: 2,
    },
    {
        zoneName: "East",
        zoneNameAr: "الشرق",
        zoneNameFr: "Est",
        wilayas: [
            "Constantine",
            "Annaba",
            "Sétif",
            "Batna",
            "Jijel",
            "Skikda",
            "Mila",
            "Oum El Bouaghi",
            "Khenchela",
            "Tébessa",
            "Souk Ahras",
            "Guelma",
            "El Tarf",
            "Bordj Bou Arréridj",
        ],
        baseFee: 70000, // 700 DZD
        estimatedDays: 3,
    },
    {
        zoneName: "West",
        zoneNameAr: "الغرب",
        zoneNameFr: "Ouest",
        wilayas: [
            "Oran",
            "Tlemcen",
            "Sidi Bel Abbès",
            "Mostaganem",
            "Mascara",
            "Relizane",
            "Tiaret",
            "Aïn Témouchent",
            "Saïda",
            "Tissemsilt",
        ],
        baseFee: 70000,
        estimatedDays: 3,
    },
    {
        zoneName: "Highlands",
        zoneNameAr: "الهضاب العليا",
        zoneNameFr: "Hauts Plateaux",
        wilayas: [
            "Laghouat",
            "Biskra",
            "Naâma",
            "El Bayadh",
            "Ghardaïa",
            "Ouargla",
            "El Oued",
            "Touggourt",
        ],
        baseFee: 80000, // 800 DZD
        estimatedDays: 4,
    },
    {
        zoneName: "South",
        zoneNameAr: "الجنوب",
        zoneNameFr: "Sud",
        wilayas: [
            "Béchar",
            "Adrar",
            "Tamanrasset",
            "Illizi",
            "Tindouf",
            "In Salah",
            "In Guezzam",
            "Bordj Badji Mokhtar",
            "Djanet",
            "El Meghaïer",
            "El Meniaa",
        ],
        baseFee: 100000, // 1000 DZD
        estimatedDays: 5,
    },
];
