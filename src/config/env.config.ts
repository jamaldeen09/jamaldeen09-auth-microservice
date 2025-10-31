import dotenv from "dotenv";
dotenv.config();

interface EnvData {
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  MONGO_URI: string;
  PORT: string;
  NODE_ENV?: string;
}

const requiredKeys: (keyof EnvData)[] = [
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

const envData: EnvData = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  MONGO_URI: process.env.MONGO_URI!,
  PORT: process.env.PORT!,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export { envData }