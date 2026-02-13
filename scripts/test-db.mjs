import clientPromise from '../lib/mongodb.ts';
import { getPortfolioData, savePortfolioData } from '../lib/storage.ts';

async function testConnection() {
    console.log('--- Phase 1: Connection Test ---');
    try {
        console.log('Connecting to MongoDB...');
        const client = await clientPromise;
        const db = client.db('portfolio');
        const collections = await db.listCollections().toArray();
        console.log('Successfully connected! Collections found:', collections.map(c => c.name));
    } catch (error) {
        console.error('FAILED to connect to MongoDB:', error);
        process.exit(1);
    }

    console.log('\n--- Phase 2: Read Test ---');
    try {
        const data = await getPortfolioData();
        console.log('Successfully fetched portfolio data. Settings name:', data.settings.name);
    } catch (error) {
        console.error('FAILED to read from MongoDB:', error);
        process.exit(1);
    }

    console.log('\n--- Phase 3: Write Test ---');
    try {
        const data = await getPortfolioData();
        const success = await savePortfolioData(data);
        if (success) {
            console.log('Successfully saved portfolio data back to MongoDB!');
        } else {
            console.error('FAILED to save portfolio data (returned false)');
            process.exit(1);
        }
    } catch (error) {
        console.error('FAILED to save to MongoDB:', error);
        process.exit(1);
    }

    console.log('\n--- ALL TESTS PASSED ---');
    process.exit(0);
}

testConnection();
