import Url from "../models/urlModels.js";
import { connectDB } from "../lib/db.js";

export default async function handler(req, res) {
  await connectDB();

  try {
    // req.query.shortCode DOES NOT WORK for clean route
    const { shortCode } = req.query;

    const url = await Url.findOne({ shortCode });

    if (!url) return res.status(404).send("URL Not Found");

    url.clicks++;
    await url.save();

    return res.redirect(url.longUrl);

  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Internal Server Error");
  }
}
