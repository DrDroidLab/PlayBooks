import { styled } from "@mui/material";
import { Link } from "react-router-dom";

export const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: "0.875rem",
  textDecoration: "none",
  color: theme.palette.primary.main,
}));
