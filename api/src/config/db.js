import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    if(process.env.DB_RESET === "true"){
        await mongoose.connection.db.dropDatabase();
        console.log("Database reset");
    }
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
