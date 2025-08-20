const express = require("express");
const { createChat, findUserChats, findChat, createGroupChat, updateGroupMembers, deleteGroup } = require("../Controllers/chat.controller");

const router = express.Router()

router.post("/", createChat)
router.post("/group", createGroupChat) // new route for group chat
router.get("/:userId", findUserChats)
router.get("/find/:firstId/:secondId", findChat)
router.patch("/:id", updateGroupMembers) // PATCH group members
router.delete("/:id", deleteGroup) // DELETE group

module.exports = router;