import { list, get } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    // 获取 ip_log 目录下所有 blobs
    const blobs = await list('ip_log/');

    const logs = [];

    for (const blob of blobs) {
      try {
        const content = await get(blob.name);
        const text = await content.text();
        // 如果是 JSON 格式，解析
        try {
          logs.push(JSON.parse(text));
        } catch {
          // 如果不是 JSON 就当作普通文本
          logs.push({ raw: text });
        }
      } catch (err) {
        console.error('读取 blob 失败:', blob.name, err);
      }
    }

    // 按时间升序排序
    logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.status(200).json(logs);
  } catch (err) {
    console.error('获取日志列表失败:', err);
    res.status(500).json([]);
  }
}
