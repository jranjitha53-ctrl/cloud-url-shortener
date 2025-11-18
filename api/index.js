// api/index.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import shortid from "shortid";
import path from "path";
import { fileURLToPath } from "url";
import Url from "../models/urlModels.js";

dotenv.config(); // Load .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// -------------------------
// ⭐ DEBUG ENV ROUTE (IMPORTANT)
// -------------------------
app.get("/api/debug-env", (req, res) => {
  res.json({
    mongoUriExists: !!process.env.MONGO_URI,
    value: process.env.MONGO_URI ? "Loaded" : "NOT LOADED",
  });
});

// -------------------------
// 🌎 CONNECT TO MONGODB
// -------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// -------------------------
// 🏠 HOME ROUTE
// -------------------------
app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to the Cloud URL Shortener API 🌐</h2>
    <p>Use <code>POST /api/shorten</code> to create short URLs.</p>
    <p>Health check: <a href="/api/health">/api/health</a></p>
  `);
});

// -------------------------
// ❤️ HEALTH CHECK
// -------------------------
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server and MongoDB are running ✅" });
});

// -------------------------
// ✂️ SHORTEN URL
// -------------------------
app.post("/api/shorten", async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortCode = shortid.generate();

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${req.headers.host}`
        : `http://localhost:${process.env.PORT || 3000}`;

    const shortUrl = `${baseUrl}/${shortCode}`;

    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();

    return res.status(201).json({ shortUrl });
  } catch (error) {
    console.error("❌ Error in /shorten:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------------
// 🔄 REDIRECT
// -------------------------
app.get("/:shortCode", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    url.clicks++;
    await url.save();

    return res.redirect(url.longUrl);
  } catch (error) {
    console.error("❌ Error in redirect:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------------
// 🚀 START LOCAL SERVER (NOT IN PRODUCTION)
// -------------------------
if (process.env.NODE_ENV !== "production") {
  const DEFAULT_PORT = process.env.PORT || 3000;
  const server = app.listen(DEFAULT_PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${DEFAULT_PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const newPort = Number(DEFAULT_PORT) + 1;
      console.warn(`⚠️ Port ${DEFAULT_PORT} busy. Trying port ${newPort}...`);
      app.listen(newPort, () => {
        console.log(`✅ Server running on http://localhost:${newPort}`);
      });
    } else {
      console.error("❌ Server Error:", err);
    }
  });
}

export default app;
