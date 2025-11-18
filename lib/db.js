import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Cluster0",    
    });

    isConnected = conn.connection.readyState === 1;
    console.log("✅ MongoDB Connected:", conn.connection.host);

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
