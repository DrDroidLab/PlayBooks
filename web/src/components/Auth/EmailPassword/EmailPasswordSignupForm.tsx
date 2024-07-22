import { RemoveRedEyeRounded, VisibilityOffRounded } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React, { useState } from "react";
import { IconButton } from "rsuite";
import CustomButton from "../../common/CustomButton/index.tsx";
import Toast from "../../Toast";
import { useNavigate } from "react-router-dom";
import {
  useLazySaveSiteUrlQuery,
  useSignupMutation,
} from "../../../store/features/auth/api/index.ts";

function EmailPasswordSignupForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [triggerSignup] = useSignupMutation();
  const [triggerSiteUrlSave] = useLazySaveSiteUrlQuery();

  const handleCloseToast = () => {
    setError("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function redirectToLoginAfterSignup() {
    navigate("/login");
  }

  const getError = (err) => {
    const errObj = err?.data;
    if (errObj && Object.keys(errObj).length !== 0) {
      if (errObj.email) return errObj.email[0];
      if (!errObj.email && errObj.password) return errObj.password[0];
      if (!errObj.email && !errObj.password && errObj.non_field_errors)
        return errObj.non_field_errors[0];

      return "Something went wrong!!";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const data = {
        email: email,
        firstName,
        lastName,
        password: password,
      };
      await triggerSignup(data).unwrap();
      await triggerSiteUrlSave({ siteUrl: window.location.origin }).unwrap();

      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");

      redirectToLoginAfterSignup();
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
      const error = getError(err);
      setError(error);
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          margin: "15px",
        }}>
        <p style={{ fontWeight: "400", color: "grey" }}>Create account</p>
      </Box>
      <form className="signup-form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>First name</InputLabel>
              <OutlinedInput
                style={{ marginBottom: "15px" }}
                required
                autoFocus
                id="firstname"
                label="First name"
                sx={{ display: "flex", mb: 4 }}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Last name</InputLabel>
              <OutlinedInput
                style={{ marginBottom: "15px" }}
                required
                id="lastname"
                label="Last name"
                sx={{ display: "flex", mb: 4 }}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>

        <FormControl fullWidth>
          <InputLabel>Email</InputLabel>
          <OutlinedInput
            style={{ marginBottom: "15px" }}
            required
            type="email"
            id="email"
            label="Email"
            sx={{ display: "flex", mb: 4 }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            style={{ marginBottom: "15px" }}
            required
            id="password"
            label="Password"
            sx={{ display: "flex", mb: 4 }}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ minLength: 8 }}
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
          {btnLoading ? (
            <CircularProgress style={{ color: "white" }} />
          ) : (
            "Sign up"
          )}
        </CustomButton>
      </form>

      <Toast
        open={!!error}
        severity="error"
        message={error}
        handleClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </div>
  );
}

export default EmailPasswordSignupForm;
