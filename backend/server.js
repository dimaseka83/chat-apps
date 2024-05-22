const path = require("path");
const http = require("http");
const cors = require("cors");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getCurrentUserByUsername
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Run when client connects
io.on("connection", (socket) => {
  // check username is used or not
  // Define the event handler for 'checkUsername'
  socket.on("checkUsername", (username, callback) => {
    const user = getCurrentUserByUsername(username);

    if (user) {
      // Send a response to the client indicating that the username is already in use
      callback(true);
    } else {
      // Send a response to the client indicating that the username is available
      callback(false);
    }
  });

  // Modify your 'joinRoom' event to emit 'checkUsername' first and handle the response
  socket.on("joinRoom", ({ username, room }) => {
    // Emit 'checkUsername' event and handle the response using a callback function
    socket.emit("checkUsername", username, (isUsernameUsed) => {
      if (isUsernameUsed) {
        socket.emit("usernameUsed", "Username has been used");
      } else {
        // Username is available, proceed with joining the room
        // Emit 'joinRoom' event with the provided username and room
        socket.emit("joinRoom", { username, room });
      }
    });
  });

  // Listen for joinRoom
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

      socket.join(user.room);
      
      // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
      
      // Broadcast when a user connects
      socket.broadcast
          .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
      );
      
      // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
  });


  // typing
  socket.on("typing", (data) => {
    const user = getCurrentUser(socket.id);

    socket.broadcast.to(user.room).emit("typing", data);
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("leaveRoom", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
