import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export const Toast = (props: any) => {
  const {
    open,
    severity,
    message,
    handleClose,
    anchorOrigin = { vertical: "top", horizontal: "right" },
    autoHideDuration = 3000,
  } = props;

  const handleCloseToast = () => {
    handleClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleCloseToast}
      anchorOrigin={anchorOrigin}>
      <MuiAlert
        className="!text-xs"
        variant="filled"
        onClose={handleCloseToast}
        severity={severity}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
