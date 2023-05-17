const messages = require("./database/inmem");
const { pub, sub } = require("./database/redis");
const { Server } = require("socket.io");
module.exports = function (httpServer) {
  const wsServer = new Server(httpServer, {
    cors: {
      origin: "http://localhost",
      methods: ["GET", "POST"],
      credentials: true,
      transports: ["websocket", "polling"],
    },
    allowEIO3: true,
  });

  sub("message", (payload) => {
    messages[payload.to] = messages[payload.to] || [];
    messages[payload.to].push(payload);
    wsServer.to(payload.to).emit("message", payload);
  }).then();

  wsServer.on("connection", (socket) => {
    const userId = socket.id;
    console.log("a user connected");
    socket.on("join", (msg) => {
      socket.join(msg.id);
    });
    socket.on("leave", (msg) => {
      socket.leave(msg.id);
    });
    socket.on("send", (msg, reply) => {
      messages[msg.to] = messages[msg.to] || [];
      messages[msg.to].push(msg);
      msg.userId = userId;
      socket.to(msg.to).emit("message", msg);
      pub("message", msg);
      reply("ok");
    });
  });
};
