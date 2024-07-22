import {
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React, { useRef, useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { IconButton } from "rsuite";
import { RemoveRedEyeRounded, VisibilityOffRounded } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../store/features/auth/api/loginApi.ts";
import Toast from "../../Toast.js";

function EmailPasswordLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [triggerLogin, { isLoading }] = useLoginMutation();
  const from = location.state?.from?.pathname || "/";
  const userRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(false);
  const [toastType, setToastType] = useState("success");

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
      if (!err) {
        handleOpenToast("No Server Response", "error");
      } else if (err?.status === 400) {
        handleOpenToast(err.data?.non_field_errors[0], "error");
      } else if (err?.status === 401) {
        handleOpenToast("Unauthorized", "error");
      } else {
        handleOpenToast("Login Failed", "error");
      }
    }
  };

  return (
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
                  <RemoveRedEyeRounded />
                ) : (
                  <VisibilityOffRounded />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      <CustomButton
        className="!bg-violet-500 !text-white !text-base w-full !justify-center hover:!bg-transparent hover:!text-violet-500 p-3 font-normal"
        onClick={handleSubmit}>
        {isLoading ? <CircularProgress style={{ color: "white" }} /> : "Login"}
      </CustomButton>

      <Toast
        open={toastOpen}
        handleClose={handleCloseToast}
        message={toastMsg}
        severity={toastType}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </form>
  );
}

export default EmailPasswordLoginForm;
