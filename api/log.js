import fetch from "node-fetch";

export default async function handler(req, res) {
  const ip =
    req.query.ip ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;
  const now = new Date().toISOString();

  const logLine = `[${now}] ${ip}\n`;

  // 生成日志文件名，例如 logs/2025-08-28.log
  const date = now.split("T")[0];
  const filePath = `logs/${date}.log`;

  // 从环境变量里读取你的 GitHub 仓库信息
  const repo = process.env.GITHUB_REPO; // 格式：username/repo
  const token = process.env.GITHUB_TOKEN; // GitHub Personal Access Token

  try {
    // 先读取文件内容
    const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    let sha = null;
    let content = "";

    const getRes = await fetch(getUrl, {
      headers: { Authorization: `token ${token}` },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      content = Buffer.from(data.content, "base64").toString("utf8");
    }

    // 拼接新的内容
    content += logLine;

    // 提交回 GitHub
    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `日志更新 ${date}`,
        content: Buffer.from(content).toString("base64"),
        sha: sha || undefined,
      }),
    });

    if (!putRes.ok) {
      throw new Error("GitHub API 写入失败");
    }

    res.status(200).json({ message: "日志已记录", ip, time: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "日志写入失败", details: err.message });
  }
}
