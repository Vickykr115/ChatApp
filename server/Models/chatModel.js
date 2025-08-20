const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    members: [{ type: String }], // array of user IDs
    name: { type: String }, // group name (optional for 1-1 chat)
    isGroup: { type: Boolean, default: false }
}, {
    timestamps: true
});

const chatModel = mongoose.model("Chat", chatSchema);
module.exports = chatModel;