import dotenv from "dotenv";
dotenv.config();
const requiredKeys = [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "MONGO_URI",
    "PORT",
];
for (const key of requiredKeys) {
    if (!process.env[key]) {
        console.error(`❌ Missing environment variable: ${key}`);
        process.exit(1);
    }
}
const envData = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV || "development",
};
export { envData };
//# sourceMappingURL=env.config.js.map