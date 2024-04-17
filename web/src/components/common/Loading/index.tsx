import React from 'react';
import { CircularProgress } from '@mui/material';

type LoadingPropTypes = {
  title?: string;
};

function Loading({ title }: LoadingPropTypes) {
  return (
    <div className="absolute z-10 top-0 left-0 w-full h-screen flex flex-col gap-2 items-center justify-center bg-white text-black">
      {title}
      <CircularProgress color="primary" />
    </div>
  );
}

export default Loading;
