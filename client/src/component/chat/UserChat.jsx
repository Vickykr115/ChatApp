import { useContext } from "react";
import { useFetchRecipentUser } from "../../hooks/useFetchRecipent";
import { ChatContext } from "../../context/ChatContext";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
} from "@mui/material";
import { Check as CheckIcon, DoneAll as DoneAllIcon, Group as GroupIcon } from "@mui/icons-material";

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipentUser(chat, user);
  const { onlineUsers, notification, markThisUserNotificationAsRead } = useContext(ChatContext);
  const { latestMessage } = useFetchLatestMessage(chat);

  const unreadNotification = (notification || []).filter((n) => !n.isRead);
  const thisUserNotification = unreadNotification?.filter((n) => n.chatId === chat._id);

  const isOnline = chat.isGroup
    ? false
    : onlineUsers?.some((onlineUser) => onlineUser?.userId === recipientUser?._id);

  const truncateText = (text) => {
    if (!text) return "";
    return text.length > 24 ? `${text.slice(0, 24)}…` : text;
  };

  const chatTitle = chat.isGroup ? chat.name : recipientUser ? recipientUser.name : "Loading…";

  return (
    <ListItem
      button
      alignItems="flex-start"
      onClick={() => {
        if (thisUserNotification?.length) {
          markThisUserNotificationAsRead(thisUserNotification, notification);
        }
      }}
      sx={{ borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <ListItemAvatar>
        {chat.isGroup ? (
          <Avatar><GroupIcon /></Avatar>
        ) : (
          <Badge
            overlap="circular"
            variant={isOnline ? "dot" : undefined}
            color="success"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Avatar>{recipientUser?.name?.[0]}</Avatar>
          </Badge>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={<Typography variant="subtitle1" fontWeight={600}>{chatTitle}</Typography>}
        secondary={
          <Box display="flex" alignItems="center" gap={1}>
            {latestMessage?.text && (
              <Typography variant="body2" color="text.secondary">
                {truncateText(latestMessage?.text)}
              </Typography>
            )}
            {latestMessage?.senderId === user?._id && (
              latestMessage?.readBy?.includes(recipientUser?._id) ? (
                <DoneAllIcon fontSize="small" />
              ) : (
                <CheckIcon fontSize="small" />
              )
            )}
          </Box>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
      <Box textAlign="right">
        <Typography variant="caption" color="text.secondary">
          {latestMessage?.createdAt ? moment(latestMessage?.createdAt).calendar() : ''}
        </Typography>
        <Box>
          {!!thisUserNotification?.length && (
            <Badge color="primary" badgeContent={thisUserNotification.length} />
          )}
        </Box>
      </Box>
    </ListItem>
  );
};

export default UserChat;