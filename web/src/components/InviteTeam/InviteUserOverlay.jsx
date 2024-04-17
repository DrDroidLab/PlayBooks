import React, { useState } from 'react';
import Overlay from '../Overlay';
import API from '../../API';
import styles from './index.module.css';
import { CircularProgress } from '@mui/material';

import ValueComponent from '../ValueComponent';

function convertStringToArray(inputString) {
  let stringArray = inputString.split(',');

  for (let i = 0; i < stringArray.length; i++) {
    let trimmedString = stringArray[i].trim();

    if (trimmedString.indexOf('@') === -1) {
      return false;
    }

    stringArray[i] = trimmedString;
  }

  return stringArray;
}

const InviteUserOverlay = ({ isOpen, toggleOverlay }) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState('');

  const sendInvites = API.useSendInvites();

  const handleSuccess = () => {
    setLoading(true);

    const emailList = convertStringToArray(emails);
    if (!emailList) {
      alert('Please enter valid emails separated by comma');
      setLoading(false);
      return;
    }

    sendInvites(
      {
        emails: emailList,
        signup_domain: window.location.hostname
      },
      response => {
        alert(response.data.message.title);
        setLoading(false);
        toggleOverlay();
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
          <div className={styles['actionOverlay']}>
            <header className="text-gray-500">Invite Users to your Account</header>
            <div className={styles['actionOverlayContent']}>
              <div className={styles['actionOverlayContentText']}>
                <ValueComponent
                  valueType={'STRING'}
                  onValueChange={val => setEmails(val)}
                  value={emails}
                  placeHolder={'Enter emails separated by comma'}
                  length={300}
                />
              </div>
            </div>

            <div className={styles['actions']}>
              <button className={styles['submitButton']} onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className={styles['submitButtonRight']}
                sx={{ marginLeft: '5px' }}
                onClick={() => handleSuccess()}
              >
                Send Invite
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
        </Overlay>
      )}
    </>
  );
};

export default InviteUserOverlay;
