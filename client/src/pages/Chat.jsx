import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import UserChat from "../component/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../component/chat/potentialChats";
import ChatBox from "../component/chat/ChatBox";

import {
  Grid,
  Paper,
  List,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";

const Chat = () => {
  const { userChats, isUserChatLoading, updateCurrentChat } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  return (
    <Grid container spacing={2}  >
      <Grid item xs={12} md={4} lg={3}>
        <PotentialChats />
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 700 }}>Chats</Typography>
          <Divider />
          {isUserChatLoading ? (
            <Typography sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} /> Loading Chats...
            </Typography>
          ) : (
            <List sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              {userChats?.map((chat, index) => (
                <div key={index} onClick={() => updateCurrentChat(chat)}>
                  <UserChat chat={chat} user={user} />
                </div>
              ))}
            </List>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={8} lg={9}>
        <ChatBox />
      </Grid>
    </Grid>
  );
};

export default Chat;