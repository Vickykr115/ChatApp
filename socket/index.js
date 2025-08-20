const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5174" });

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
            if(user){
                io.to(user.socketId).emit("getMessage", message);
                io.to(user.socketId).emit("getNotification", {
                    senderId: message.senderId,
                    chatId: message.chatId,
                    isRead : false,
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

    socket.on("disconnect", ()=>{
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)

            io.emit("getOnlineUsers", onlineUsers)


    })
});

io.listen(3000);