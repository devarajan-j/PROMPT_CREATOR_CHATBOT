const chatArea = document.getElementById("chatArea");
const messageBox = document.getElementById("message");
const form = document.getElementById("chatForm");
const sendBtn = document.getElementById("sendBtn");
const hero = document.getElementById("hero");
const newChat = document.getElementById("newChat");
const themeBtn = document.getElementById("themeBtn");
const micBtn = document.getElementById("micBtn");

let history = [];
let busy = false;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function addMessage(role, content) {
  const row = document.createElement("div");
  row.className = "message " + role;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "YOU" : "P";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = escapeHtml(content);
  if (role === "assistant") {
    const copy = document.createElement("button");
    copy.className = "copy";
    copy.textContent = "COPY RESPONSE";
    copy.onclick = async () => {
      await navigator.clipboard.writeText(content);
      copy.textContent = "COPIED";
      setTimeout(() => copy.textContent = "COPY RESPONSE", 1200);
    };
    bubble.appendChild(copy);
  }
  row.append(avatar, bubble);
  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function resize() {
  messageBox.style.height = "auto";
  messageBox.style.height = Math.min(messageBox.scrollHeight, 160) + "px";
}
messageBox.addEventListener("input", resize);

async function sendMessage(text) {
  text = text.trim();
  if (!text || busy) return;
  busy = true;
  sendBtn.disabled = true;
  hero.style.display = "none";
  addMessage("user", text);
  history.push({role:"user", content:text});
  messageBox.value = "";
  resize();

  const loading = document.createElement("div");
  loading.className = "message assistant";
  loading.innerHTML = '<div class="avatar">P</div><div class="bubble">Thinking…</div>';
  chatArea.appendChild(loading);
  chatArea.scrollTop = chatArea.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text, history:history.slice(0,-1)})
    });
    const data = await res.json();
    loading.remove();
    if (!res.ok) throw new Error(data.error || "Request failed");
    addMessage("assistant", data.reply);
    history.push({role:"assistant", content:data.reply});
  } catch (err) {
    loading.remove();
    addMessage("assistant", "Error: " + err.message);
  } finally {
    busy = false;
    sendBtn.disabled = false;
    messageBox.focus();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(messageBox.value);
});

messageBox.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(messageBox.value);
  }
});

document.querySelectorAll("[data-prompt]").forEach(btn => {
  btn.addEventListener("click", () => {
    messageBox.value = btn.dataset.prompt;
    resize();
    messageBox.focus();
  });
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    messageBox.value = btn.dataset.starter || "";
    resize();
    messageBox.focus();
  });
});

newChat.addEventListener("click", () => {
  history = [];
  chatArea.innerHTML = "";
  hero.style.display = "";
  messageBox.value = "";
  resize();
  messageBox.focus();
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-prompt]");
  if (btn && !btn.closest(".nav-item")) sendMessage(btn.dataset.prompt);
});

// Browser voice input
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;
  micBtn.addEventListener("click", () => {
    try {
      recognition.start();
      micBtn.classList.add("recording");
      micBtn.textContent = "●";
    } catch (_) {}
  });
  recognition.onresult = e => {
    messageBox.value = e.results[0][0].transcript;
    resize();
  };
  recognition.onend = () => {
    micBtn.classList.remove("recording");
  };
} else {
  micBtn.title = "Voice input is not supported by this browser";
  micBtn.style.opacity = ".45";
}
