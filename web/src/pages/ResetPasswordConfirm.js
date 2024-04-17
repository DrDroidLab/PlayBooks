import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../data/black_logo.png';
import '../css/SignUp.css';
import axios from 'axios';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { CardContent, CircularProgress } from '@mui/material';
import Toast from '../components/Toast';
import posthog from 'posthog-js';

const BlankLayoutWrapper = styled(Box)(({ theme }) => ({
  // For V1 Blank layout pages
  '& .content-center': {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5)
  }
}));

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' },
  [theme.breakpoints.down('sm')]: { width: '100%' }
}));

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}));

function ResetPasswordConfirm() {
  const urlParams = new URLSearchParams(window.location.search);

  const reset_token = urlParams.get('reset_token');
  const email = urlParams.get('email');

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const handleCloseToast = () => {
    setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function redirectToLoginAfterSignup() {
    navigate('/login', { state: { prevState: 'reset_password' } });
  }

  const handleSubmit = async e => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const data = {
        email: email,
        token: reset_token,
        new_password: password
      };
      await axios.post('/accounts/reset-user-password-confirm/', JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      setPassword('');

      redirectToLoginAfterSignup();

      posthog.identify(email);
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
    }
  };

  return (
    <BlankLayoutWrapper className="layout-wrapper">
      <Box
        className="app-content"
        sx={{
          minHeight: '100vh',
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: '#F4F5FA'
        }}
      >
        <Box className="content-center">
          <Card sx={{ zIndex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  margin: '25px'
                }}
              >
                <img src={logo} alt="Your logo" />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  margin: '15px'
                }}
              >
                <p style={{ fontWeight: '400', color: 'grey' }}>Reset Password for {email}</p>
              </Box>
              <form className="signup-form" onSubmit={handleSubmit}>
                <FormControl fullWidth>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    style={{ marginBottom: '15px' }}
                    required
                    id="password"
                    label="Password"
                    sx={{ display: 'flex', mb: 4 }}
                    onChange={e => setPassword(e.target.value)}
                    inputProps={{ minLength: 8 }}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <RemoveRedEyeIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <br />

                <Button
                  style={{ marginBottom: '15px' }}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ mb: 7 }}
                >
                  {btnLoading ? <CircularProgress style={{ color: 'white' }} /> : 'Reset Password'}
                </Button>

                <br></br>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2">Remember the password? &nbsp;</Typography>
                  <Typography variant="body2">
                    <LinkStyled to="/login">Sign in</LinkStyled>
                  </Typography>
                </Box>
              </form>
              <Toast
                open={!!error}
                severity="error"
                message={error}
                handleClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </BlankLayoutWrapper>
  );
}

export default ResetPasswordConfirm;
