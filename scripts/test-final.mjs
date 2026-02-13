import { MongoClient } from 'mongodb';

const variants = [
    { label: "Encoded @, with DB", uri: "mongodb+srv://cvasolves:BalderDash%40026@cluster0.zb7fpxi.mongodb.net/portfolio?retryWrites=true&w=majority" },
    { label: "Encoded @, NO DB", uri: "mongodb+srv://cvasolves:BalderDash%40026@cluster0.zb7fpxi.mongodb.net/?retryWrites=true&w=majority" },
    { label: "Encoded @, authSource=admin", uri: "mongodb+srv://cvasolves:BalderDash%40026@cluster0.zb7fpxi.mongodb.net/portfolio?authSource=admin&retryWrites=true&w=majority" }
];

async function run() {
    for (const v of variants) {
        console.log(`--- Testing ${v.label} ---`);
        const client = new MongoClient(v.uri, { serverSelectionTimeoutMS: 5000 });
        try {
            await client.connect();
            console.log("SUCCESS!");
            const dbs = await client.db().admin().listDatabases();
            console.log("Databases:", dbs.databases.map(d => d.name));
            await client.close();
            return;
        } catch (e) {
            console.log("FAILED:", e.message);
        }
    }
    console.log("--- ALL VARIANTS FAILED ---");
}

run();
