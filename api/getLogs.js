import { list, get } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const blobs = await list(); // 获取所有 blob
    if (!Array.isArray(blobs)) {
      return res.json([]); // 如果不是数组就返回空列表
    }

    const logs = [];
    for (const blob of blobs) {
      const content = await get(blob.name, { access: 'public' });
      logs.push(JSON.parse(content));
    }
    res.json(logs);
  } catch (err) {
    console.error('获取日志列表失败:', err);
    res.status(500).json({ error: '获取日志列表失败' });
  }
}
