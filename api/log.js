// api/log.js

// Secret key to view the logs. Change "mysecret123" to whatever you want!
const SECRET_PASSWORD = "mysecret123";

// In-memory array to hold the visitor logs
let ipLog = [];

export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers['x-real-ip'] || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();

  // 1. Check if the user is trying to VIEW the logs
  if (req.method === 'GET') {
    const { secret } = req.query;

    // If the secret parameter doesn't match, block access
    if (!secret || secret !== SECRET_PASSWORD) {
      return res.status(403).json({ error: "Access Denied" });
    }

    // If it matches, return the data
    return res.status(200).json({
      message: "Authorized IP Log History",
      logs: ipLog
    });
  }

  // 2. Handle LOGGING a new visit with a username
  if (req.method === 'POST') {
    const { username } = req.body || {};

    if (ip) {
      // Add the entry with their submitted name, IP, and time
      ipLog.unshift({ 
        username: username || "Anonymous/Skipped",
        ip: ip, 
        time: timestamp, 
        userAgent: req.headers['user-agent'] 
      });
      
      if (ipLog.length > 50) ipLog.pop(); // Keep log short
    }

    return res.status(200).json({ status: "logged" });
  }

  return res.status(405).end();
}
