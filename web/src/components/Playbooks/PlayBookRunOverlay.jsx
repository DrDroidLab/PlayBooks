import { useState } from 'react';
import Overlay from '../Overlay';
import API from '../../API';
import styles from './index.module.css';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PlayBookRunOverlay = ({ pb_id, pb_name, isOpen, toggleOverlay, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const runPlayBook = API.useRunPlayBook();

  const handleSuccess = () => {
    setLoading(true);
    runPlayBook(
      {
        playbook_id: pb_id
      },
      response => {
        if (response.data.success && response.data.playbook_run_id) {
          navigate('/playbook-runs/' + response.data.playbook_run_id);
        }
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
            <header className="text-gray-500">
              Run <b>{pb_name}</b>?
            </header>
            <div className={styles['actions']}>
              <button className={styles['submitButton']} onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className={styles['submitButtonRight']}
                sx={{ marginLeft: '5px' }}
                onClick={() => handleSuccess()}
              >
                Yes
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

export default PlayBookRunOverlay;
