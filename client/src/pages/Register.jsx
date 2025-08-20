// src/pages/Register.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
  PersonAddAlt1
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Register = () => {
  
const { registerInfo ,  updateRegisterInfo, registerUser, registerError, isRegisterLoading} = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register submitted:', form);
    // 👉 Call API or validation logic here
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f0f4f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
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
            width: { xs: '90vw', sm: 450 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Box mb={2}>
            <PersonAddAlt1 fontSize="large" color="primary" />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Create Account
            </Typography>
          </Box>

          <form onSubmit={registerUser}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              margin="normal"
              name="name"
              type="text"
              required
            //   onChange={handleChange}
           onChange={(e) => updateRegisterInfo({ ...registerInfo, name: e.target.value })}

            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              name="email"
              type="email"
              required
              onChange={(e) => updateRegisterInfo({ ...registerInfo, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
               onChange={(e) => updateRegisterInfo({ ...registerInfo, password: e.target.value })}
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
              Register
            </Button>
            {isRegisterLoading ? "creating your accound" :"Register"}
          </form>

          <Typography variant="body2" mt={2} color="text.secondary">
            Already have an account? <a href="/login">Login</a>
          </Typography>
          
          <Typography variant="body2" mt={2} color="text.secondary">
           {
            registerError?.error
            
           }
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;
