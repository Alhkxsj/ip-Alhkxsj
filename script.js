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

    // 添加新的日志记录到前端显示
    if (data.url) {
      appendLog(`${new Date().toLocaleString()} - ${username} - ${data.ip}`);
    }

    // 同步后台存储的日志列表（不清空已有显示）
    fetchLogs();
  } catch (err) {
    ipEl.textContent = '加载失败';
    console.error(err);
  }
}

function appendLog(line) {
  const li = document.createElement('li');
  li.textContent = line;
  logList.prepend(li);

  // 保留最新 200 条记录
  while (logList.childNodes.length > 200) {
    logList.removeChild(logList.lastChild);
  }
}

async function fetchLogs() {
  try {
    const res = await fetch('/api/getLogs');
    const logs = await res.json(); // 假设返回数组：[{ timestamp, username, ip }]
    logs.forEach(l => {
      // 防止重复显示：检查是否已经显示
      const text = `${new Date(l.timestamp).toLocaleString()} - ${l.username} - ${l.ip}`;
      if (![...logList.childNodes].some(li => li.textContent === text)) {
        appendLog(text);
      }
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
fetchLogs();
fetchIP();