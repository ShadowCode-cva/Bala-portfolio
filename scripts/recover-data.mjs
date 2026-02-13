import { MongoClient } from 'mongodb';
import fs from 'fs';

const uri = "mongodb+srv://cvasolves:BalderDash%40026@cluster0.zb7fpxi.mongodb.net/portfolio?retryWrites=true&w=majority";

async function recover() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    try {
        await client.connect();
        console.log('Connected!');
        const db = client.db('portfolio');
        const data = await db.collection('content').findOne({});

        if (data) {
            const { _id, ...rest } = data;
            fs.writeFileSync('data.json', JSON.stringify(rest, null, 2));
            console.log('SUCCESS: Data recovered and saved to data.json');
        } else {
            console.log('No data found in MongoDB.');
        }
    } catch (e) {
        console.error('RECOVERY FAILED:', e.message);
    } finally {
        await client.close();
    }
}

recover();
