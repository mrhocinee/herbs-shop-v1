import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    pgEnum,
    serial,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
]);

export const localeEnum = pgEnum("locale", ["ar", "fr", "en"]);

// ─── Users ───────────────────────────────────────────────────

export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        passwordHash: text("password_hash").notNull(),
        phone: varchar("phone", { length: 20 }).notNull(),
        role: userRoleEnum("role").notNull().default("customer"),
        // Address fields (Algeria-specific)
        wilaya: varchar("wilaya", { length: 100 }),
        commune: varchar("commune", { length: 100 }),
        street: text("street"),
        locale: localeEnum("locale").notNull().default("fr"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("users_email_idx").on(table.email),
        index("users_wilaya_idx").on(table.wilaya),
    ]
);

// ─── Categories ──────────────────────────────────────────────

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    nameAr: varchar("name_ar", { length: 255 }).notNull(),
    nameFr: varchar("name_fr", { length: 255 }).notNull(),
    nameEn: varchar("name_en", { length: 255 }).notNull(),
    descriptionAr: text("description_ar"),
    descriptionFr: text("description_fr"),
    descriptionEn: text("description_en"),
    icon: varchar("icon", { length: 50 }), // Lucide icon name
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

// ─── Products ────────────────────────────────────────────────

export const products = pgTable(
    "products",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        categoryId: integer("category_id")
            .notNull()
            .references(() => categories.id, { onDelete: "restrict" }),
        slug: varchar("slug", { length: 200 }).notNull().unique(),
        nameAr: varchar("name_ar", { length: 255 }).notNull(),
        nameFr: varchar("name_fr", { length: 255 }).notNull(),
        nameEn: varchar("name_en", { length: 255 }).notNull(),
        descriptionAr: text("description_ar"),
        descriptionFr: text("description_fr"),
        descriptionEn: text("description_en"),
        price: integer("price").notNull(), // In centimes (DZD * 100)
        weight: integer("weight"), // Grams
        stock: integer("stock").notNull().default(0),
        images: jsonb("images").$type<string[]>().default([]),
        tags: jsonb("tags").$type<string[]>().default([]),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("products_category_idx").on(table.categoryId),
        index("products_slug_idx").on(table.slug),
        index("products_active_idx").on(table.isActive),
    ]
);

// ─── Orders ──────────────────────────────────────────────────

export interface ShippingAddress {
    name: string;
    phone: string;
    wilaya: string;
    commune: string;
    street: string;
    notes?: string;
}

export const orders = pgTable(
    "orders",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        orderNumber: serial("order_number"), // Human-readable
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        status: orderStatusEnum("status").notNull().default("pending"),
        totalAmount: integer("total_amount").notNull(), // Centimes DZD
        shippingFee: integer("shipping_fee").notNull().default(0),
        shippingAddress: jsonb("shipping_address")
            .$type<ShippingAddress>()
            .notNull(),
        wilaya: varchar("wilaya", { length: 100 }).notNull(), // Denormalized for fast zone queries
        commune: varchar("commune", { length: 100 }).notNull(),
        notes: text("notes"),
        confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
        shippedAt: timestamp("shipped_at", { withTimezone: true }),
        deliveredAt: timestamp("delivered_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("orders_user_idx").on(table.userId),
        index("orders_status_idx").on(table.status),
        index("orders_wilaya_idx").on(table.wilaya),
        index("orders_created_idx").on(table.createdAt),
    ]
);

// ─── Order Items ─────────────────────────────────────────────

export const orderItems = pgTable(
    "order_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "restrict" }),
        quantity: integer("quantity").notNull(),
        unitPrice: integer("unit_price").notNull(), // Snapshot at order time
    },
    (table) => [index("order_items_order_idx").on(table.orderId)]
);

// ─── Shipment Zones ──────────────────────────────────────────

export const shipmentZones = pgTable("shipment_zones", {
    id: serial("id").primaryKey(),
    zoneName: varchar("zone_name", { length: 100 }).notNull().unique(),
    zoneNameAr: varchar("zone_name_ar", { length: 100 }),
    zoneNameFr: varchar("zone_name_fr", { length: 100 }),
    wilayas: jsonb("wilayas").$type<string[]>().notNull(), // Array of wilaya names/codes
    baseFee: integer("base_fee").notNull(), // Centimes DZD
    estimatedDays: integer("estimated_days").notNull().default(3),
    isActive: boolean("is_active").notNull().default(true),
});

// ─── Relations ───────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));
