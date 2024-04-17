import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from './components/Toast';
import useToggle from './hooks/useToggle';

const ErrorPage = ({ error, children }) => {
  const { isOpen, toggle } = useToggle();
  const handleToastClose = () => {
    toggle();
  };
  return (
    <>
      {children}
      <Toast
        open={!isOpen}
        severity="error"
        message={error}
        handleClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  );
};

const ErrorHandler = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  switch (location?.state?.['errorStatusCode']) {
    case 404:
      navigate('/PageNotFound');
      break;
    case 500:
      return <ErrorPage error={location.state?.err} children={children} />;
    case 200:
      return <ErrorPage error={location.state?.err} children={children} />;
    case 400:
      return <ErrorPage error={location.state?.err} children={children} />;
    default:
      return children;
  }
};

export default ErrorHandler;
