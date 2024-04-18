import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';

const Refresh = ({ onRefreshCb, disabled }) => {
  return (
    <Button
      disabled={disabled}
      aria-label="capture screenshot"
      onClick={onRefreshCb}
      sx={{ color: 'grey' }}
    >
      <RefreshIcon />
    </Button>
  );
};

export default Refresh;
