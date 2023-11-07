const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");

const app = express();
app.use(bodyParser.json());
const socket = require("socket.io");

dotenv.config();

port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB successfully");
  })
  .catch((err) => {
    console.log("Error: ", err);
    return "Internal Server Error";
    // res.status(500).json({ msg: "Internal Server Error" });
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

try {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3000",
      credential: true,
    },
  });

  global.onlineUsers = new Map();

  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
      console.log("sendmsg", data.message);
      const sendUserSocket = onlineUsers.get(data.io);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-received", data.message);
      }
    });
  });
} catch (error) {
  console.log("error ", error);
}
