const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
});

app.post("/alert", (req, res) => {
  console.log("🚨 ALERT:", req.body);

  io.emit("alert", req.body);

  res.sendStatus(200);
});

server.listen(4000, () => {
  console.log("🔥 Realtime server running on http://localhost:4000");
});