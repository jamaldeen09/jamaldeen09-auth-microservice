import mongoose from "mongoose";
import { envData } from "./env.config.js";
import { app } from "../server.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const initDb = async (): Promise<void> => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const conn = await mongoose.connect(envData.MONGO_URI, {
                autoIndex: false,
                connectTimeoutMS: 10000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

            // ** Boot up server *only after* DB connection success ** \\
            app.listen(envData.PORT, () =>
                console.log(`🚀 Server running on http://localhost:${envData.PORT}`)
            );
            return;
        } catch (err) {
            retries++;
            console.error(`❌ MongoDB connection failed (${retries}/${MAX_RETRIES})`);
            console.error(err);

            if (retries < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.error("💀 All retry attempts failed. Exiting process.");
                process.exit(1);
            }
        }
    }
};

export default initDb