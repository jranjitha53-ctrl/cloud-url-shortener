export default function handler(req, res) {
  res.status(200).send(`
    <h2>Cloud URL Shortener API 🌐</h2>
    <p>Use the following routes:</p>
    <ul>
      <li><b>POST</b> /api/shorten — create short URLs</li>
      <li><b>GET</b> /api/debug-env — check MongoDB URI loaded</li>
      <li><b>GET</b> /api/health — API health check</li>
      <li><b>GET</b> /[shortCode] — redirect to full URL</li>
    </ul>
  `);
}
