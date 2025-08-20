import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { baseUrl } from "../../utils/service";

import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { GroupAdd as GroupAddIcon } from "@mui/icons-material";

const PotentialChats = () => {
  const { user } = useContext(AuthContext);
  const {
    userChats,
    createChats,
    onlineUsers,
    allUsers,
    setCurrentChat,
    userChats: chats,
    updateCurrentChat,
  } = useContext(ChatContext);

  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = search.trim()
    ? allUsers?.filter((u) => u._id !== user._id)?.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const groupSelectableUsers = allUsers?.filter((u) => u._id !== user._id) || [];

  const handleUserClick = async (otherUserId) => {
    const existingChat = chats?.find(
      (chat) => chat.members.includes(user._id) && chat.members.includes(otherUserId) && !chat.isGroup
    );

    if (existingChat) {
      setCurrentChat(existingChat);
      setSearch("");
    } else {
      await createChats(user._id, otherUserId);
      setTimeout(() => {
        const updatedChat = chats?.find(
          (chat) => chat.members.includes(user._id) && chat.members.includes(otherUserId) && !chat.isGroup
        );
        if (updatedChat) setCurrentChat(updatedChat);
        setSearch("");
      }, 300);
    }
  };

  const handleGroupUserToggle = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      alert("Group name and at least 2 users required");
      return;
    }
    const members = [user._id, ...selectedUsers];
    const res = await fetch(`${baseUrl}/chats/group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members, name: groupName }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to create group");
      return;
    }
    setShowGroupModal(false);
    setGroupName("");
    setSelectedUsers([]);
    setTimeout(() => {
      updateCurrentChat(data);
    }, 300);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3, width:"60vh" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" startIcon={<GroupAddIcon />} onClick={() => setShowGroupModal(true)}>
          Create Group
        </Button>
      </Stack>

      {search.trim() ? (
        <List dense>
          {filteredUsers?.length ? (
            filteredUsers.map((u) => (
              <ListItem key={u._id} button onClick={() => handleUserClick(u._id)}>
                <ListItemAvatar>
                  <Avatar>{u.name?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{u.name}</Typography>
                      {onlineUsers?.some((o) => o?.userId === u?._id) && (
                        <Typography variant="caption" color="success.main">
                          • online
                        </Typography>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ px: 1, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
        </List>
      ) : null}

      <Dialog open={showGroupModal} onClose={() => setShowGroupModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Group</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            size="small"
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
            {groupSelectableUsers.map((u) => (
              <FormControlLabel
                key={u._id}
                control={
                  <Checkbox
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => handleGroupUserToggle(u._id)}
                  />
                }
                label={u.name}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGroupModal(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PotentialChats;