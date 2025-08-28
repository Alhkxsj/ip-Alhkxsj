const usernameEl = document.getElementById('username');
const ipEl = document.getElementById('ip');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');
const logList = document.getElementById('logList');

async function fetchIP() {
  try {
    const username = prompt("请输入你的用户名:", "匿名") || "匿名";
    usernameEl.textContent = username;

    const res = await fetch(`/api/log?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    ipEl.textContent = data.ip || '无法获取';

    // 更新日志显示
    if (data.url) {
      appendLog(`${new Date().toLocaleString()} - ${username} - ${data.ip}`);
      fetchLogs(); // 读取最新日志列表
    }
  } catch (err) {
    ipEl.textContent = '加载失败';
    console.error(err);
  }
}

function appendLog(line) {
  const li = document.createElement('li');
  li.textContent = line;
  logList.prepend(li);
  if (logList.childNodes.length > 50) logList.removeChild(logList.lastChild);
}

async function fetchLogs() {
  try {
    // 这里示例用 Vercel Blob SDK 获取所有 blobs
    // 你需要在后端提供一个 endpoint 返回所有 log URL 或内容
    const res = await fetch('/api/getLogs');
    const logs = await res.json(); // 假设返回数组：[{ timestamp, username, ip }]
    logList.innerHTML = '';
    logs.reverse().forEach(l => {
      appendLog(`${new Date(l.timestamp).toLocaleString()} - ${l.username} - ${l.ip}`);
    });
  } catch (err) {
    console.error('获取日志失败', err);
  }
}

refreshBtn.addEventListener('click', fetchIP);

copyBtn.addEventListener('click', () => {
  const ip = ipEl.textContent;
  if (ip && ip !== '加载中...' && ip !== '加载失败') {
    navigator.clipboard.writeText(ip).then(() => {
      alert('IP已复制到剪贴板！');
    });
  }
});

// 初次加载
fetchIP();
