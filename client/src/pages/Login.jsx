// src/pages/Login.js

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {

    const {loginUser, loginError,loginInfo,updateLoginInfo,isLoginLoading, logoutUser} = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', form);
    // 👉 You can add API call logic here
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2, // for mobile padding
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: { xs: '90vw', sm: 400 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Box mb={2}>
            <LockOutlined fontSize="large" color="primary" />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Sign In
            </Typography>
          </Box>

          <form onSubmit={loginUser}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              name="email"
              type="email"
              required
              onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
              type="submit"
            >
              Login
            </Button>
          </form>

          <Typography variant="body2" mt={2} color="text.secondary">
            {loginError?.error && (<>An error occur</>)}
          </Typography>

          <Typography variant="body2" mt={2} color="text.secondary">
            Don’t have an account? <a href="/register">Register</a>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
