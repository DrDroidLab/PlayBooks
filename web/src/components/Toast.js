import React from 'react';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

function Toast(props) {
  const {
    open,
    severity,
    message,
    handleClose,
    anchorOrigin = { vertical: 'top', horizontal: 'right' },
    autoHideDuration = 3000
  } = props;

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    handleClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleCloseToast}
      anchorOrigin={anchorOrigin}
    >
      <MuiAlert variant="filled" onClose={handleCloseToast} severity={severity}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
}

export default Toast;
