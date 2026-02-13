import { MongoClient } from 'mongodb';
import fs from 'fs';

async function runTest() {
    console.log('--- Phase 1: Environment Check ---');
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const match = envFile.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);

    if (!match) {
        console.error('FAILED to find MONGODB_URI in .env.local');
        process.exit(1);
    }

    const uri = match[1];
    console.log('URI extracted (obscured):', uri.replace(/:.+@/, ':****@'));

    console.log('\n--- Phase 2: Connection Test ---');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        const db = client.db('portfolio');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        console.log('\n--- Phase 3: Write/Upsert Test ---');
        const testData = {
            settings: { name: "Test User", updated_at: new Date().toISOString() },
            last_write_test: new Date().toISOString()
        };

        const result = await db.collection('content').updateOne(
            { is_test_doc: true },
            { $set: testData },
            { upsert: true }
        );

        console.log('Write/Upsert successful! Modified count:', result.modifiedCount, 'UpsertedId:', result.upsertedId);

        console.log('\n--- Phase 4: Cleanup ---');
        await db.collection('content').deleteOne({ is_test_doc: true });
        console.log('Test document deleted.');

    } catch (error) {
        console.error('DATABASE ERROR:', error);
        process.exit(1);
    } finally {
        await client.close();
    }

    console.log('\n--- ALL TESTS PASSED ---');
    process.exit(0);
}

runTest();
