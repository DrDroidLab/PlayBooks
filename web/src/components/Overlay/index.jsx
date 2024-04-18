import React from 'react';
import styles from './index.module.css';

const Overlay = props => {
  const { children, visible } = props;
  return (
    <>
      {visible && (
        <div className={styles.overlay}>
          <div className={styles.children}>{children}</div>
        </div>
      )}
    </>
  );
};

export default Overlay;
