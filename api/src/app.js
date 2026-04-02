import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import rootRouter from "./routes/routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", rootRouter);

connectDb();

export default app;
