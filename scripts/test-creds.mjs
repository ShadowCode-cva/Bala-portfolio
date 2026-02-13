import { MongoClient } from 'mongodb';

const password_variants = [
    "BalderDash%40026",
    "BalderDash@026"
];

async function test(pass) {
    const uri = `mongodb+srv://cvasolves:${pass}@cluster0.zb7fpxi.mongodb.net/portfolio?retryWrites=true&w=majority`;
    console.log(`Testing with password format: ${pass}`);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        console.log(`SUCCESS with ${pass}`);
        await client.close();
        return true;
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
        return false;
    }
}

async function run() {
    for (const p of password_variants) {
        if (await test(p)) break;
    }
}

run();
