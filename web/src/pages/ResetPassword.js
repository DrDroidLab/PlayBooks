import React, { useState, useRef } from "react";
import "../css/Login.css";
import { Link } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MuiCard from "@mui/material/Card";
import { CircularProgress, CardContent } from "@mui/material";
import Toast from "../components/Toast";
import posthog from "posthog-js";

const BlankLayoutWrapper = styled(Box)(({ theme }) => ({
  // For V1 Blank layout pages
  "& .content-center": {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(5),
  },
}));

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: { width: "28rem" },
  [theme.breakpoints.down("sm")]: { width: "100%" },
}));

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: "0.875rem",
  textDecoration: "none",
  color: theme.palette.primary.main,
}));

function ResetPassword() {
  const userRef = useRef();
  const [email, setEmail] = useState("");
  const [toastOpen, setToastOpen] = useState("");
  const [toastMsg, setToastMsg] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [btnLoading, setBtnLoading] = useState(false);

  const handleOpenToast = (msg, toastType) => {
    setToastMsg(msg);
    setToastType(toastType);
    setToastOpen(true);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const data = {
        email: email,
      };
      const response = await axios.post(
        "/accounts/reset-user-password/",
        JSON.stringify(data),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      const response_text = response?.data?.message.title;
      handleOpenToast(response_text, "success");
      setBtnLoading(false);
      posthog.identify(data.email, {
        identify_type: "other",
      });
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
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
                  <img src={"/logo/drdroid-logo-full.png"} alt="Your logo" />
                </Box>

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
                  <Button
                    style={{ marginBottom: "25px" }}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{ mb: 7 }}>
                    {btnLoading ? (
                      <CircularProgress style={{ color: "white" }} />
                    ) : (
                      "Request Password Reset Link"
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
                      Remember the password?&nbsp;
                    </Typography>
                    <Typography variant="body2">
                      <LinkStyled to="/login">Login</LinkStyled>
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

export default ResetPassword;
