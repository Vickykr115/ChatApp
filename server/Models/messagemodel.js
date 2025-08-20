const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chatId: String,
    senderId: String,
    text: String,
    readBy: { type: [String], default: [] }, // user IDs who have read this message
    system: { type: Boolean, default: false } // system message flag
}, {
    timestamps: true
})

const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;