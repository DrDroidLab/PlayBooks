import * as React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const TableSkeleton = ({ noOfLines = 6 }) => {
  return (
    <Box
      sx={{
        height: 'max-content'
      }}
    >
      {[...Array(noOfLines)].map((item, idx) => (
        <Skeleton variant="rectangular" sx={{ my: 4, mx: 1, height: '30px' }} key={idx} />
      ))}
    </Box>
  );
};

export default TableSkeleton;
