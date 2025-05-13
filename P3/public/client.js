const socket = io();

const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");

function appendMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

socket.on("message", appendMessage);

sendButton.addEventListener("click", () => {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit("chatMessage", msg);
    messageInput.value = "";
  }
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});