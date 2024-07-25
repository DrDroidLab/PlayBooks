import { Box, Typography } from "@mui/material";
import React from "react";
import { LinkStyled } from "./LinkStyled.tsx";

function ForgotPasswordBox() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
      <Typography variant="body2">Forgot password? &nbsp;</Typography>
      <Typography variant="body2">
        <LinkStyled to="/reset-password">Reset</LinkStyled>
      </Typography>
    </Box>
  );
}

export default ForgotPasswordBox;
