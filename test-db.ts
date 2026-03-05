import { db } from './src/db';
import { products } from './src/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const result = await db.select().from(products).limit(1);
        console.log('DB SUCCESS:', result.length);
    } catch (e) {
        console.error('DB ERROR:', e);
    }
}
main();
