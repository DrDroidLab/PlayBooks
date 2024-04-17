import React from 'react';
import { Outlet } from 'react-router-dom';
import { PrivateAxiosProvider } from '../context/PrivateAxiosProvider';

const AxiosPrivate = () => {
  return (
    <PrivateAxiosProvider>
      <Outlet />
    </PrivateAxiosProvider>
  );
};

export default AxiosPrivate;
