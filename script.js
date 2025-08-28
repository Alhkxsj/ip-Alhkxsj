const usernameEl = document.getElementById('username');
const ipEl = document.getElementById('ip');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');

async function fetchIP() {
  try {
    const username = prompt("请输入你的用户名:", "匿名") || "匿名";
    usernameEl.textContent = username;

    const res = await fetch(`/api/log?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    ipEl.textContent = data.ip || '无法获取';
  } catch (err) {
    ipEl.textContent = '加载失败';
    console.error(err);
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

fetchIP();
