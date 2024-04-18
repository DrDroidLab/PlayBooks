import React, { useState } from 'react';
import Overlay from './components/Overlay';
import API from './API';

import styles from './components/Playbooks/index.module.css';
import { CircularProgress } from '@mui/material';

const SlackConnectOverlay = ({ isOpen, toggleOverlay, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const requestSlackConnect = API.useRequestSlackConnect();

  const close = () => {
    toggleOverlay();
    setShowSuccess(false);
    onRefresh();
  };

  const handleSuccess = () => {
    setLoading(true);
    requestSlackConnect(
      {},
      response => {
        setLoading(false);
        setShowSuccess(true);
      },
      () => {
        setLoading(false);
        toggleOverlay();
      }
    );
  };

  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
          {!showSuccess && (
            <div className={styles['actionOverlay']}>
              <header className="text-gray-800" style={{ fontSize: '14px' }}>
                Connect with Doctor Droid team on Slack?
              </header>
              <br></br>
              <p className="text-gray-500" style={{ fontSize: '14px' }}>
                We will be inviting you to a slack channel.
              </p>
              <div className={styles['actions']}>
                <button className={styles['submitButton']} onClick={toggleOverlay}>
                  Cancel
                </button>
                <button
                  className={styles['submitButtonRight']}
                  sx={{ marginLeft: '5px' }}
                  onClick={() => handleSuccess()}
                >
                  Send me invite
                </button>
                {loading ? (
                  <CircularProgress
                    style={{
                      marginLeft: '12px',
                      marginBottom: '12px'
                    }}
                    size={20}
                  />
                ) : (
                  ''
                )}
              </div>
            </div>
          )}
          {showSuccess && (
            <div className={styles['actionOverlay']}>
              <header className="text-gray-500">
                {'Check your inbox for an invite to join Doctor Droid on Slack.'}
              </header>
              <div className={styles['actions']}>
                <button className={styles['submitButton']} onClick={close}>
                  Close
                </button>
              </div>
            </div>
          )}
        </Overlay>
      )}
    </>
  );
};

export default SlackConnectOverlay;
