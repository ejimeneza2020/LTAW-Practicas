// Archivo: server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedUsers = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
  connectedUsers++;

  // Enviar mensaje de bienvenida solo al nuevo usuario
  socket.emit("message", "Bienvenido al chat!");

  // Avisar a los demás de la nueva conexión
  socket.broadcast.emit("message", "Un nuevo usuario se ha conectado.");

  socket.on("chatMessage", (msg) => {
    if (msg.startsWith("/")) {
      // Procesar comando
      switch (msg) {
        case "/help":
          socket.emit("message", "Comandos disponibles: /help, /list, /hello, /date");
          break;
        case "/list":
          socket.emit("message", `Usuarios conectados: ${connectedUsers}`);
          break;
        case "/hello":
          socket.emit("message", "¡Hola! ¿Cómo estás?");
          break;
        case "/date":
          socket.emit("message", `Fecha actual: ${new Date().toLocaleString()}`);
          break;
        default:
          socket.emit("message", "Comando no reconocido. Usa /help para ver la lista de comandos.");
      }
    } else {
      // Enviar mensaje a todos los clientes
      io.emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    io.emit("message", "Un usuario se ha desconectado.");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));