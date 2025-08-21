import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { Box, Typography, Chip } from "@mui/material";

const TypingIndicator = ({ currentChatId }) => {
  const { typingUsers } = useContext(ChatContext);

  // Filter typing users for the current chat
  const currentChatTypingUsers = typingUsers.filter(
    (typingUser) => typingUser.chatId === currentChatId
  );

  if (currentChatTypingUsers.length === 0) {
    return null;
  }

  // Create typing message based on number of users typing
  const getTypingMessage = () => {
    const count = currentChatTypingUsers.length;
    
    if (count === 1) {
      return `${currentChatTypingUsers[0].userName} is typing...`;
    } else if (count === 2) {
      return `${currentChatTypingUsers[0].userName} and ${currentChatTypingUsers[1].userName} are typing...`;
    } else if (count === 3) {
      return `${currentChatTypingUsers[0].userName}, ${currentChatTypingUsers[1].userName} and ${currentChatTypingUsers[2].userName} are typing...`;
    } else {
      return `${currentChatTypingUsers[0].userName}, ${currentChatTypingUsers[1].userName} and ${count - 2} others are typing...`;
    }
  };

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Chip
        size="small"
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ fontStyle: "italic" }}>
              {getTypingMessage()}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  animation: "typing-dot 1.4s infinite ease-in-out",
                  animationDelay: "0s",
                }}
              />
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  animation: "typing-dot 1.4s infinite ease-in-out",
                  animationDelay: "0.2s",
                }}
              />
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  animation: "typing-dot 1.4s infinite ease-in-out",
                  animationDelay: "0.4s",
                }}
              />
            </Box>
          </Box>
        }
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          "& .MuiChip-label": {
            px: 1,
          },
          "@keyframes typing-dot": {
            "0%, 60%, 100%": {
              transform: "translateY(0)",
              opacity: 0.4,
            },
            "30%": {
              transform: "translateY(-8px)",
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
};

export default TypingIndicator;
 
