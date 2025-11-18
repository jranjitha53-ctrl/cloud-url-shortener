import shortid from "shortid";
import Url from "../models/urlModels.js";
import { connectDB } from "../lib/db.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { longUrl } = req.body;

    if (!longUrl || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortCode = shortid.generate();

    const baseUrl = `https://${req.headers.host}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    const newUrl = new Url({ longUrl, shortCode });
    await newUrl.save();

    res.status(201).json({ shortUrl });

  } catch (err) {
    console.error("Error in /shorten:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
