import mongoose from "mongoose";
import dotenv from"dotenv";

dotenv.config();

const DBURL = process.env.DBURL;

let db;

function normalizeMongoUri(uri) {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^/]+)(\/.*)?$/);

    if (!match) {
        return uri;
    }

    const [, scheme, authority, path = ""] = match;
    const atIndex = authority.lastIndexOf("@");

    if (atIndex === -1) {
        return uri;
    }

    const auth = authority.slice(0, atIndex);
    const hosts = authority.slice(atIndex + 1);
    const colonIndex = auth.indexOf(":");

    if (colonIndex === -1) {
        return uri;
    }

    const username = auth.slice(0, colonIndex);
    const password = auth.slice(colonIndex + 1);

    return `${scheme}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts}${path}`;
}

export async function connectDB(){
    if(!db){
        try {
            db = await mongoose.connect(DBURL);
        } catch (error) {
            try {
                db = await mongoose.connect(normalizeMongoUri(DBURL));
            } catch (retryError) {
                console.error("Database connection failed:", retryError.message);
                return null;
            }
        }
    }
    return db;
}