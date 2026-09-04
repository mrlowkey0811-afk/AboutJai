// api/log.js

// A simple in-memory array to hold the last 50 IPs (resets whenever the serverless function sleeps)
let ipLog = [];

export default function handler(req, res) {
  // 1. Extract the IP address from Vercel's headers
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers['x-real-ip'] || req.socket.remoteAddress;

  // 2. Extract timestamp
  const timestamp = new Date().toISOString();

  // 3. Handle the viewing dashboard request
  if (req.method === 'GET') {
    return res.status(200).json({
      message: "IP Log History",
      logs: ipLog
    });
  }

  // 4. Handle logging a new visit (POST request or image load)
  if (req.method === 'POST' || req.url.includes('pixel.gif')) {
    if (ip && !ipLog.some(log => log.ip === ip && (new Date() - new Date(log.time)) < 5000)) {
      // Add to log if it's not a rapid duplicate refresh
      ipLog.unshift({ ip, time: timestamp, userAgent: req.headers['user-agent'] });
      if (ipLog.length > 50) ipLog.pop(); // Keep list short
    }

    // If it's the transparent tracking pixel image, return a 1x1 transparent GIF
    if (req.url.includes('pixel.gif')) {
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).send(buffer);
    }

    return res.status(200).json({ status: "logged", yourIp: ip });
  }

  return res.status(405).end();
}
