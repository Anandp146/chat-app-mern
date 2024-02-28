// Import required modules and packages
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/message");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

// Enable Cross-Origin Resource Sharing (CORS) and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB database
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connection Successful");
    })
    .catch((err) => {
        console.log(err.message);
    });

// Define routes for authentication and messaging
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start the server and configure Socket.IO
const server = app.listen(process.env.PORT, () =>
    console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
    // Configure CORS for Socket.IO
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

// Global Map to store online users and their Socket.IO IDs
global.onlineUsers = new Map();

// Handle Socket.IO connections
io.on("connection", (socket) => {
    // Set the global chatSocket to the current socket
    global.chatSocket = socket;

    // Event: "add-user" - Handle when a user connects and add them to the onlineUsers Map
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    // Event: "send-msg" - Handle when a user sends a message and forward it to the recipient
    socket.on("send-msg", (data) => {
        // Get the recipient's Socket.IO ID from the onlineUsers Map
        const sendUserSocket = onlineUsers.get(data.to);

        // If the recipient is online, emit the message to their socket
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});
