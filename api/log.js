import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const username = req.query.username || '匿名';
    
    // 记录公网 IP（使用 VPN/代理时为代理 IP）
    const ip = req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.socket.remoteAddress;

    const date = new Date().toISOString().slice(0,10);
    const filename = `logs/${date}.log`;
    const logLine = `[${new Date().toISOString()}] ${username} - ${ip}\n`;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    // 获取现有日志内容
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    let content = '';
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
      content = Buffer.from(data.content, 'base64').toString();
    }

    const newContent = content + logLine;

    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `[IP Logger] 添加访问日志`,
        content: Buffer.from(newContent).toString('base64'),
        sha: sha || undefined
      })
    });

    res.status(200).json({ ip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ip: null });
  }
}
