import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import { hideSnackbar, snackbarSelector } from '../../../store/features/snackbar/snackbarSlice.ts';
import { Alert } from '@mui/material';
import SeeMoreText from '../../Playbooks/SeeMoreText.jsx';

export function GlobalSnackbar() {
  const { open, message } = useSelector(snackbarSelector);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      typeof="error"
      autoHideDuration={5000}
      onClose={handleClose}
      message={message}
    >
      <Alert variant="filled" onClose={handleClose} severity={'error'}>
        <SeeMoreText text={message} />
      </Alert>
    </Snackbar>
  );
}
