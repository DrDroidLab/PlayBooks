import { Box, styled } from "@mui/material";

export const BlankLayoutWrapper = styled(Box)(({ theme }) => ({
  "& .content-center": {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .content-center-video": {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
  },
}));
