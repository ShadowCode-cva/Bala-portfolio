import { MongoClient } from 'mongodb';

const uris = [
    "mongodb+srv://cvasolves:BalderDash@026@zb7fpxi.mongodb.net/portfolio?retryWrites=true&w=majority", // Original
    "mongodb+srv://cvasolves:BalderDash%40026@zb7fpxi.mongodb.net/portfolio?retryWrites=true&w=majority" // Encoded
];

async function test(uri, label) {
    console.log(`--- Testing ${label} ---`);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('SUCCESS!');
        await client.close();
    } catch (e) {
        console.log('FAILED:', e.message);
    }
}

async function run() {
    for (const uri of uris) {
        await test(uri, uris.indexOf(uri) === 0 ? "Original" : "Encoded");
    }
}

run();
