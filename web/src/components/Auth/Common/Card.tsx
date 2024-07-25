import { styled } from "@mui/material";
import MuiCard from "@mui/material/Card";

export const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: { width: "28rem" },
  [theme.breakpoints.down("sm")]: { width: "100%" },
}));
