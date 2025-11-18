export default function handler(req, res) {
  res.json({
    mongoUriExists: !!process.env.MONGO_URI,
    value: process.env.MONGO_URI ? "Loaded" : "NOT LOADED"
  });
}
