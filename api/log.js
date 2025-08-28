import { put } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const username = req.query.username || '匿名';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    const filename = `log_${Date.now()}.json`;
    const content = JSON.stringify({ username, ip, timestamp });

    const { url } = await put(`ip_log/${filename}`, content, { access: 'public' });

    res.status(200).json({ ip, url });
  } catch (err) {
    console.error('写日志失败:', err);
    res.status(500).json({ ip: null });
  }
}
