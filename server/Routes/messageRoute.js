const express = require("express");
const { createMessage, getMessages, markMessagesAsRead } = require("../Controllers/message.controller");

const router = express.Router()

router.post("/", createMessage)
router.get("/:chatId", getMessages)
router.post("/read", markMessagesAsRead) // new route

module.exports = router;