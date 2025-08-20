const messageModel = require("../Models/messagemodel");

// create message

const createMessage = async (req, res) => {
    try {
        const { chatId, senderId, text } = req.body;
        const message = new messageModel({
            chatId,
            senderId,
            text,
            readBy: [senderId], // sender has read their own message
        });
        const savedMessage = await message.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark messages as read by a user in a chat
const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        await messageModel.updateMany(
            { chatId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get message
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await messageModel.find({ chatId });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = { createMessage, getMessages, markMessagesAsRead }