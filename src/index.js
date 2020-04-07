const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const rooms = new Map();
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    //incrementing count in room.
    if (rooms.has(user.room)) {
      rooms.set(user.room, rooms.get(user.room) + 1);
    } else {
      rooms.set(user.room, 1);
    }
    console.log(rooms);

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome to chatapp"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
    callback();
  });

  socket.on("roomsdetail", () => {
    socket.emit("roomcnt", rooms);
  });
  socket.on("clientmsg", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed");
    }

    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} is left`)
      );

      //decrementing count of user from room
      if (rooms.get(user.room) == 0) {
        rooms.delete(user.room);
      } else {
        rooms.set(user.room, rooms.get(user.room) - 1);
      }

      console.log(rooms);

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, position)
    );
    callback("location is shared successfully with everyone");
  });
});

server.listen(port, () => {
  console.log(`server started at ${port}`);
});
