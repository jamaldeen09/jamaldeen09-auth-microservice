// ** Imports ** \\
import cookieParser from "cookie-parser";
import express, { Application } from "express";
import cors from "cors"
import initDb from "./config/database.config.js";
import authRouter from "./routes/auth.routes.js";

// ** Express app initialization ** \\s
const app: Application = express();

// ** Cache store ** \\
const cacheStore: Map<string, string> = new Map();

// ** Global middlewares ** \\
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: "http://localhost:3000", 
    methods: ["POST", "GET", "PATCH", "DELETE", "PUT"],
    credentials: true,
}));

// ** Database initialization ** \\
initDb();

// ** Routers ** \\
app.use("/api/v1/auth", authRouter);

// ** Exports ** \\
export { cacheStore, app }
 