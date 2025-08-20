import { AppBar, Toolbar, Typography, Button, Box, IconButton, Stack } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import Notification from "./chat/Notification";
import ChatIcon from "@mui/icons-material/Chat";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={1} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton edge="start" color="inherit">
              <ChatIcon />
            </IconButton>
            <Typography variant="h6">ChatApp</Typography>
          </Stack>

          <Box>
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Notification />
                <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Hello, {user.name || 'User'}
                </Typography>
                <Button color="inherit" onClick={() => logoutUser()}>Logout</Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
};

export default Navbar;
