import React, { useState, useRef } from "react";
import "../css/Login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MuiCard from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import { CircularProgress, CardContent } from "@mui/material";
import Toast from "../components/Toast";
import { useLoginMutation } from "../store/features/auth/api/loginApi.ts";

const BlankLayoutWrapper = styled(Box)(({ theme }) => ({
  "& .content-center": {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(5),
  },
}));

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: { width: "28rem" },
  [theme.breakpoints.down("sm")]: { width: "100%" },
}));

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: "0.875rem",
  textDecoration: "none",
  color: theme.palette.primary.main,
}));

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const prevState = location.state?.prevState || "";
  const userRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState("");
  const [toastMsg, setToastMsg] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [triggerLogin, { isLoading }] = useLoginMutation();

  const handleOpenToast = (msg, toastType) => {
    setToastMsg(msg);
    setToastType(toastType);
    setToastOpen(true);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        email: email,
        password: password,
      };
      await triggerLogin(data).unwrap();
      setEmail("");
      setPassword("");
      handleOpenToast("Login Successful!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        handleOpenToast("No Server Response", "error");
      } else if (err.response?.status === 400) {
        handleOpenToast(err.response?.data?.non_field_errors[0], "error");
      } else if (err.response?.status === 401) {
        handleOpenToast("Unauthorized", "error");
      } else {
        handleOpenToast("Login Failed", "error");
      }
    }
  };

  return (
    <>
      <BlankLayoutWrapper className="layout-wrapper">
        <Box
          className="app-content"
          sx={{
            minHeight: "100vh",
            overflowX: "hidden",
            position: "relative",
            backgroundColor: "#F4F5FA",
          }}>
          <Box className="content-center">
            <Card sx={{ zIndex: 1 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    margin: "30px",
                  }}>
                  <img
                    src={"/logo/drdroid-logo-full.png"}
                    width={200}
                    alt="DrDroid Logo"
                  />
                </Box>

                {prevState === "signup_filled" ? (
                  <Alert
                    icon={false}
                    style={{
                      backgroundColor: "rgba(145, 85, 253, 0.12)",
                      marginBottom: "10px",
                    }}>
                    <Typography
                      variant="caption"
                      style={{
                        color: "rgb(149 84 255)",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}>
                      We have sent you an email for verification.
                      <br />
                      You can still login and explore.
                    </Typography>
                  </Alert>
                ) : (
                  ""
                )}

                <form className="signup-form" onSubmit={handleSubmit}>
                  <FormControl fullWidth>
                    <InputLabel>Email</InputLabel>
                    <OutlinedInput
                      autoFocus
                      style={{ marginBottom: "15px" }}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      ref={userRef}
                      autoComplete={"off"}
                      type="email"
                      id="email"
                      label="Email"
                      sx={{ display: "flex", mb: 4 }}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      style={{ marginBottom: "15px" }}
                      required
                      id="password"
                      label="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      ref={userRef}
                      autoComplete={"off"}
                      sx={{ display: "flex", mb: 4 }}
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            aria-label="toggle password visibility">
                            {showPassword ? (
                              <RemoveRedEyeIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  <Button
                    style={{ marginBottom: "25px" }}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{ mb: 7 }}>
                    {isLoading ? (
                      <CircularProgress style={{ color: "white" }} />
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}>
                    <Typography variant="body2">
                      Forgot password? &nbsp;
                    </Typography>
                    <Typography variant="body2">
                      <LinkStyled to="/reset-password">Reset</LinkStyled>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}>
                    <Typography variant="body2">
                      Don't have an account?&nbsp;
                    </Typography>
                    <Typography variant="body2">
                      <LinkStyled to="/signup">Sign up</LinkStyled>
                    </Typography>
                  </Box>
                </form>
                <Toast
                  open={toastOpen}
                  handleClose={handleCloseToast}
                  message={toastMsg}
                  severity={toastType}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </BlankLayoutWrapper>
    </>
  );
}

export default Login;
