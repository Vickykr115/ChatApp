const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user.routes");
const chatRoutes = require("./Routes/chatroute");
const messageRoutes = require("./Routes/messageRoute");

const { Server } = require("socket.io");

const app = express();

app.use(express.json());
app.use(cors());
require("dotenv").config();

app.get("/", (req, res)=>{
    res.send("Welcome to our chat app...");
})

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

const expressserver = app.listen(port, (req, res) => {
    console.log(`Server running on ${port}`)
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Mongo Db connected successfuly")).catch((error) => console.log("connection failed", error.message));

const io = new Server(expressserver, { 
    cors: {
        origin: "*", // Allow all origins for testing, restrict in production
        methods: ["GET", "POST"]
    }
});

let onlineUsers = [];
io.on("connection", (socket) => {
    console.log("new connection", socket.id)
    // listen to a connection
    socket.on("addNewUser", (userId) => {
        !onlineUsers.some(user => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
        console.log("online user", onlineUsers)
        io.emit("getOnlineUsers", onlineUsers)
    })

    // add message 

    socket.on("sendMessage", (message) => {
        // message: { chatId, senderId, text, recipientId, ... }
        if (message.isGroup && Array.isArray(message.groupMembers)) {
            // Group message: notify all group members except sender
            message.groupMembers.forEach(memberId => {
                if (memberId !== message.senderId) {
                    const user = onlineUsers.find(user => user.userId === memberId);
                    if (user) {
                        io.to(user.socketId).emit("getMessage", message);
                        io.to(user.socketId).emit("getNotification", {
                            senderId: message.senderId,
                            chatId: message.chatId,
                            isRead: false,
                            date: new Date(),
                            isGroup: true,
                            groupName: message.groupName,
                        });
                    }
                }
            });
        } else {
            // 1-1 message
            const user = onlineUsers.find(user => user.userId === message.recipientId)
            if (user) {
                io.to(user.socketId).emit("getMessage", message);
                io.to(user.socketId).emit("getNotification", {
                    senderId: message.senderId,
                    chatId: message.chatId,
                    isRead: false,
                    date: new Date(),
                });
            }
        }
    })

    // Group update events
    socket.on("groupUpdated", ({ chat }) => {
        io.emit("groupUpdated", { chat });
    });
    socket.on("groupDeleted", ({ chatId }) => {
        io.emit("groupDeleted", { chatId });
    });

    // --- Add this block for typing indicator support ---
    socket.on("typing", ({ chatId, userId, userName, isGroup, groupMembers, recipientId }) => {
        if (isGroup && Array.isArray(groupMembers)) {
            groupMembers.forEach(memberId => {
                if (memberId !== userId) {
                    const user = onlineUsers.find(u => u.userId === memberId);
                    if (user) {
                        io.to(user.socketId).emit("userTyping", { chatId, userId, userName, isGroup: true });
                    }
                }
            });
        } else if (recipientId) {
            const user = onlineUsers.find(u => u.userId === recipientId);
            if (user) {
                io.to(user.socketId).emit("userTyping", { chatId, userId, userName, isGroup: false });
            }
        }
    });

    socket.on("stopTyping", ({ chatId, userId, isGroup, groupMembers, recipientId }) => {
        if (isGroup && Array.isArray(groupMembers)) {
            groupMembers.forEach(memberId => {
                if (memberId !== userId) {
                    const user = onlineUsers.find(u => u.userId === memberId);
                    if (user) {
                        io.to(user.socketId).emit("userStoppedTyping", { chatId, userId, isGroup: true });
                    }
                }
            });
        } else if (recipientId) {
            const user = onlineUsers.find(u => u.userId === recipientId);
            if (user) {
                io.to(user.socketId).emit("userStoppedTyping", { chatId, userId, isGroup: false });
            }
        }
    });
    // --- End typing indicator block ---

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)

        io.emit("getOnlineUsers", onlineUsers)


    })
});

// io.listen(3000);