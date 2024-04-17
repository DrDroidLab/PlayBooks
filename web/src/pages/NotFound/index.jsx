import React from 'react';
import NotFoundImage from '../../data/error_screen_icon.svg';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
const NotFound = () => {
  const navigate = useNavigate();
  const onBackClick = () => navigate('/');
  return (
    <div className={styles.notFoundContainer}>
      <img
        onLoad={event => event.target?.classList?.add(styles['animate'])}
        src={NotFoundImage}
        alt="404 not found"
      />
      <div variant="p2">Page Not Found</div>
      <button onClick={onBackClick} variant="text">
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
