import { useSelector, useDispatch } from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import {
  hideSnackbar,
  snackbarSelector,
} from "../../../store/features/snackbar/snackbarSlice.ts";
import { Alert } from "@mui/material";
import SeeMoreText from "../../Playbooks/SeeMoreText.tsx";

export function GlobalSnackbar() {
  const { open, message, type } = useSelector(snackbarSelector);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      typeof={type}
      autoHideDuration={5000}
      onClose={handleClose}
      message={message}>
      <Alert variant="filled" onClose={handleClose} severity={type}>
        <SeeMoreText title={""} text={message} />
      </Alert>
    </Snackbar>
  );
}
