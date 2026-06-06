import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.mongodb.net/dr-astro?retryWrites=true&w=majority';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(MONGODB_URI);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(MONGODB_URI);
        clientPromise = client.connect();
    }
}

export async function connectToDatabase() {
    if (typeof window !== 'undefined') {
        throw new Error('connectToDatabase must only be called on the server side.');
    }
    const connection = await clientPromise;
    const db = connection.db();
    return { db, client: connection };
}
