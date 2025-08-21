import { useContext, useMemo, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";

import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const Notification = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);
  const { notification, userChats, allUsers, markAllNotificationsAsRead, MarkNotificationAsRead } = useContext(ChatContext);

  const unread = useMemo(() => (notification || []).filter((n) => !n.isRead), [notification]);

  const decorated = useMemo(
    () =>
      (notification || []).map((n) => {
        const sender = allUsers?.find((u) => u._id === n.senderId);
        return { ...n, senderName: sender?.name };
      }),
    [notification, allUsers]
  );

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (n) => {
    const chat = userChats.find((chat) => chat._id === n.chatId);
    if (chat) {
      MarkNotificationAsRead(n, userChats, user, notification);
      handleClose();
    }
  };

  // Fix: Mark all notifications as read for all chats, not just current chat
  const handleMarkAllAsRead = () => {
    const mNotifications = notification.map(n =>
      !n.isRead ? { ...n, isRead: true } : n
    );
    // Directly update notification state via context
    // If markAllNotificationsAsRead expects the new array, call it with mNotifications
    markAllNotificationsAsRead(mNotifications);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unread.length || 0} color="error">
          <ChatBubbleIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 340, p: 1 } }}
      >
        <Box sx={{ px: 1, py: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
            {!!notification?.length && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
          {!decorated?.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No Notification Yet..
            </Typography>
          ) : (
            decorated.map((n, idx) => (
              <Box
                key={idx}
                onClick={() => handleNotificationClick(n)}
                sx={{
                  p: 1.2,
                  cursor: "pointer",
                  bgcolor: n.isRead ? "transparent" : "action.hover",
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <Typography variant="body2">
                  {n.isGroup ? `${n.groupName || "Group"}: New message` : `${n.senderName} sent you a new message`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {moment(n.date).calendar()}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};

export default Notification;