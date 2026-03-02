import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, products } from "../db/schema";
import { CATEGORIES, PRODUCTS } from "./demo-data";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        // 1. Seed Categories
        console.log("Inserting categories...");
        const catMap = new Map<string, number>();

        for (const cat of CATEGORIES) {
            const inserted = await db.insert(categories).values({
                slug: cat.slug,
                nameAr: cat.nameAr,
                nameFr: cat.nameFr,
                nameEn: cat.nameEn,
                descriptionAr: cat.descAr,
                descriptionFr: cat.descFr,
                descriptionEn: cat.descEn,
                icon: cat.icon,
                sortOrder: cat.sortOrder,
            }).returning();
            catMap.set(cat.id, inserted[0].id);
        }

        // 2. Seed Products
        console.log("Inserting products...");
        for (const prod of PRODUCTS) {
            const dbCategoryId = catMap.get(prod.categoryId);
            if (!dbCategoryId) continue;

            await db.insert(products).values({
                categoryId: dbCategoryId,
                slug: prod.slug,
                nameAr: prod.nameAr,
                nameFr: prod.nameFr,
                nameEn: prod.nameEn,
                descriptionAr: prod.descAr,
                descriptionFr: prod.descFr,
                descriptionEn: prod.descEn,
                price: prod.price,
                stock: prod.stock,
                images: prod.images || [],
                tags: prod.tags || [],
                isActive: true,
            });
        }

        console.log("✅ Seeding complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await client.end();
    }
}

seed();
