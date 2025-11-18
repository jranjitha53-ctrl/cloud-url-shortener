import Url from "../models/urlModels.js";
import { connectDB } from "../lib/db.js";

export default async function handler(req, res) {
  await connectDB();

  try {
    const { shortCode } = req.query;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    url.clicks++;
    await url.save();

    return res.redirect(url.longUrl);

  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
