import { useContext, useState, useCallback, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipentUser } from "../../hooks/useFetchRecipent";
import { baseUrl } from "../../utils/service";
import moment from "moment";
import TypingIndicator from "./TypingIndicator";

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Stack,
  TextField,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Send as SendIcon,
  DeleteForever as DeleteForeverIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const {
    currentChat,
    messages,
    isMessageLoading,
    sendTextMessage,
    allUsers,
    userChats,
    updateCurrentChat,
    createChats,
    setCurrentChat,
    emitGroupUpdate,
    emitGroupDelete,
    emitTyping,
    emitStopTyping,
  } = useContext(ChatContext);

  const { recipientUser } = useFetchRecipentUser(currentChat, user);
  const [textMessage, setTextMessage] = useState("");
  const scroll = useRef();
  const isGroup = currentChat?.isGroup;

  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const [membersOpen, setMembersOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);

  // Typing detection functions
  const handleTypingStart = useCallback(() => {
    if (!isTyping && currentChat) {
    
      setIsTyping(true);
      if (isGroup) {
        emitTyping(currentChat._id, true, currentChat.members);
      } else {
        emitTyping(currentChat._id, false);
      }
    }
  }, [isTyping, currentChat, isGroup, emitTyping]);

  const handleTypingStop = useCallback(() => {
    if (isTyping && currentChat) {
      setIsTyping(false);
      if (isGroup) {
        emitStopTyping(currentChat._id, true, currentChat.members);
      } else {
        emitStopTyping(currentChat._id, false);
      }
    }
  }, [isTyping, currentChat, isGroup, emitStopTyping]);

  // Handle text input changes with typing detection
  const handleTextChange = useCallback((e) => {
    const value = e.target.value;
    setTextMessage(value);

    // Start typing if user is typing and not already marked as typing
    if (value.length > 0) {
      handleTypingStart();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 2000);
    } else {
      // Stop typing immediately if input is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTypingStop();
    }
  }, [handleTypingStart, handleTypingStop]);

  // Clean up typing timeout on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        handleTypingStop();
      }
    };
  }, [currentChat, handleTypingStop]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
    if (currentChat && user) {
      fetch(`${baseUrl}/messages/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: currentChat._id, userId: user._id }),
      });
    }
  }, [messages]);

  const groupMembers = isGroup
    ? allUsers?.filter((u) => currentChat.members.includes(u._id))
    : [];

  const usersNotInGroup = isGroup
    ? allUsers?.filter((u) => !currentChat.members.includes(u._id))
    : [];

  const handleMemberClick = useCallback(
    async (memberId) => {
      if (memberId === user._id) return;
      let chat = userChats?.find(
        (c) => !c.isGroup && c.members.includes(user._id) && c.members.includes(memberId)
      );
      if (chat) {
        updateCurrentChat(chat);
      } else {
        const res = await createChats(user._id, memberId);
        setTimeout(() => {
          const newChat = typeof res === "object" && res?._id
            ? res
            : userChats?.find(
                (c) => !c.isGroup && c.members.includes(user._id) && c.members.includes(memberId)
              );
          if (newChat) updateCurrentChat(newChat);
        }, 300);
      }
      setMembersOpen(false);
    },
    [user._id, userChats, updateCurrentChat, createChats]
  );

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    await fetch(`${baseUrl}/chats/${currentChat._id}`, { method: "DELETE" });
    emitGroupDelete(currentChat._id);
    setCurrentChat(null);
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    const updatedMembers = currentChat.members.filter((id) => id !== user._id);
    const res = await fetch(`${baseUrl}/chats/${currentChat._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: updatedMembers }),
    });
    const updatedChat = await res.json();
    emitGroupUpdate(updatedChat);
    await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentChat._id,
        senderId: user._id,
        text: `${user.name} left the group.`,
        system: true,
      }),
    });
    setCurrentChat(null);
  };

  const handleAddMember = async (userId) => {
    setAddingUserId(userId);
    const updatedMembers = [...currentChat.members, userId];
    const res = await fetch(`${baseUrl}/chats/${currentChat._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: updatedMembers }),
    });
    const updatedChat = await res.json();
    emitGroupUpdate(updatedChat);

    const addedUser = allUsers.find((u) => u._id === userId);
    if (addedUser) {
      await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentChat._id,
          senderId: user._id,
          text: `${user.name} added ${addedUser.name} to the group.`,
          system: true,
        }),
      });
    }

    setAddMembersOpen(false);
    setAddingUserId(null);
  };

  if (!recipientUser && !isGroup)
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", flex: 1 }}>
        <Typography variant="body1" color="text.secondary">
          No Conversation Selected yet..
        </Typography>
      </Paper>
    );

  if (!messages)
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", flex: 1 }}>
        <Typography variant="body1" color="text.secondary">
          Loading chat..
        </Typography>
      </Paper>
    );

  return (
    <Paper elevation={2} sx={{ flex: 1, display: "flex", height: "calc(100vh - 160px)", borderRadius: 3, overflow: "hidden", width:"60vh" ,ml:8}}>
      {/* Header */}
      <Stack sx={{ width: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Avatar>
            {isGroup ? <GroupIcon /> : <PersonIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ cursor: isGroup ? "pointer" : "default" }} onClick={isGroup ? () => setMembersOpen(true) : undefined}>
              {isGroup ? `${currentChat?.name || "Group"}` : recipientUser?.name}
            </Typography>
            {isGroup && (
              <Typography variant="caption" color="text.secondary">
                Members: {currentChat?.members?.length || 0}
              </Typography>
            )}
          </Box>

          {isGroup && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Add member">
                <IconButton onClick={() => setAddMembersOpen(true)}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Leave group">
                <IconButton color="warning" onClick={handleLeaveGroup}>
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete group">
                <IconButton color="error" onClick={handleDeleteGroup}>
                  <DeleteForeverIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "background.default" }}>
          {isMessageLoading && (
            <Stack alignItems="center" sx={{ my: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          )}

          <Stack spacing={1.5}>
            {messages?.map((message, index) => {
              const isSelf = message?.senderId === user?._id;
              if (message.system) {
                return (
                  <Stack key={index} alignItems="center" ref={index === messages.length - 1 ? scroll : undefined}>
                    <Chip size="small" label={message.text} variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {moment(message.createdAt).calendar()}
                    </Typography>
                  </Stack>
                );
              }
              return (
                <Stack key={index} direction="column" alignItems={isSelf ? "flex-end" : "flex-start"} ref={index === messages.length - 1 ? scroll : undefined}>
                  <Box sx={{ maxWidth: "70%", p: 1.25, borderRadius: 2, bgcolor: isSelf ? "primary.main" : "grey.100", color: isSelf ? "primary.contrastText" : "text.primary" }}>
                    <Typography variant="body2">{message.text}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {moment(message.createdAt).calendar()}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>

        {/* Typing Indicator */}
        <TypingIndicator currentChatId={currentChat?._id} />

        <Divider />

        {/* Composer */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={textMessage}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Stop typing when sending message
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                handleTypingStop();
                sendTextMessage(textMessage, user, setTextMessage, currentChat._id);
              }
            }}
            onBlur={() => {
              // Stop typing when user leaves the input field
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              handleTypingStop();
            }}
          />
          <IconButton
            color="primary"
            onClick={() => {
              // Stop typing when sending message
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              handleTypingStop();
              sendTextMessage(textMessage, user, setTextMessage, currentChat._id);
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Members Dialog */}
      <Dialog open={!!isGroup && membersOpen} onClose={() => setMembersOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Group Members
          <IconButton onClick={() => setMembersOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {groupMembers?.length ? (
              groupMembers.map((m) => (
                <ListItem
                  key={m._id}
                  button={m._id !== user._id}
                  onClick={() => m._id !== user._id && handleMemberClick(m._id)}
                >
                  <ListItemAvatar>
                    <Avatar>{m.name?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        {m.name} {m._id === user._id && <Chip size="small" label="You" sx={{ ml: 1 }} />}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No members found
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<PersonAddIcon />} onClick={() => setAddMembersOpen(true)}>
            Add Member
          </Button>
          <Button color="warning" startIcon={<ExitToAppIcon />} onClick={handleLeaveGroup}>
            Leave Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={!!isGroup && addMembersOpen} onClose={() => setAddMembersOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Add Member
          <IconButton onClick={() => setAddMembersOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {usersNotInGroup?.length ? (
              usersNotInGroup.map((m) => (
                <ListItem key={m._id} button onClick={() => handleAddMember(m._id)}>
                  <ListItemAvatar>
                    <Avatar>{m.name?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={addingUserId === m._id ? "Adding..." : m.name} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No users to add
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default ChatBox;
 
