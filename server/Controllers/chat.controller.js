const chatModel = require("../Models/chatModel")
// createchat

const createChat = async (req, res) => {
  const { firstId, secondId } = req.body;


  try {
    const chat = await chatModel.findOne({
        members:{$all:[firstId, secondId]}
    })
    if(chat) return res.status(200).json(chat);

    const newChat = new chatModel({
        members:[firstId, secondId]
    })

    const response = await newChat.save()
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// getUserChat

const findUserChats = async(req,res)=>{
    const userId = req.params.userId;

    try{
        const chats = await chatModel.find({
            members:{$in: [userId]}
        })
            res.status(200).json(chats);

    } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
// Find chat
const findChat = async(req,res)=>{
  const { firstId, secondId } = req.params;

    try{
        const chat = await chatModel.findOne({
            members:{$all: [firstId, secondId]}
        })
            res.status(200).json(chat);

    } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

// Create group chat
const createGroupChat = async (req, res) => {
  const { members, name } = req.body;
  if (!members || !Array.isArray(members) || members.length < 3) {
    return res.status(400).json({ error: "Group must have at least 3 members" });
  }
  try {
    const newChat = new chatModel({
      members,
      name,
      isGroup: true
    });
    const response = await newChat.save();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH group members (add/remove)
const updateGroupMembers = async (req, res) => {
  const chatId = req.params.id;
  const { members } = req.body;
  try {
    const chat = await chatModel.findByIdAndUpdate(
      chatId,
      { members },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: "Group not found" });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE group
const deleteGroup = async (req, res) => {
  const chatId = req.params.id;
  try {
    const chat = await chatModel.findByIdAndDelete(chatId);
    if (!chat) return res.status(404).json({ error: "Group not found" });
    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createChat,
  findChat,
  findUserChats,
  createGroupChat,
  updateGroupMembers,
  deleteGroup
}
