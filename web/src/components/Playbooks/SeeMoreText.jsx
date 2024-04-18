import { useState } from 'react';

import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';

const SeeMoreText = ({ title, text, truncSize = 50 }) => {
  const [open, setOpen] = useState(false);

  const TRUNC_SIZE = truncSize;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <p style={{ fontSize: '12px' }}>
        {text.length > TRUNC_SIZE ? `${text.substring(0, TRUNC_SIZE)}...` : text}
        {text.length > TRUNC_SIZE && (
          <span
            style={{
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: 5
            }}
            onClick={handleOpen}
          >
            See full
          </span>
        )}
      </p>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <h3 style={{ marginBottom: '5px' }}>
            <b>{title}</b>
          </h3>
          <p style={{ fontSize: '12px', width: '100%', overflowWrap: 'break-word' }}>{text}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SeeMoreText;
