import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import rootRouter from "./routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", rootRouter);

connectDb();

export default app;
