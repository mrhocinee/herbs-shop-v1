import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("DB URL:", process.env.DATABASE_URL?.substring(0, 30) + '...');
    try {
        const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
        const result = await client`SELECT 1 as result`;
        console.log("SUCCESS:", result);
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}
main();
