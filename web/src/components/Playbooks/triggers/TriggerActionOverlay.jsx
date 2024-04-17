/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import styles from './index.module.css';
import { CircularProgress } from '@mui/material';
import { useDeleteTriggerMutation } from '../../../store/features/triggers/api/deleteTriggerApi.ts';
import Overlay from '../../Overlay/index.jsx';

const TriggerActionOverlay = ({ trigger, playbook, isOpen, toggleOverlay, refreshTable }) => {
  const [deleteTrigger, { isLoading, isSuccess, status }] = useDeleteTriggerMutation();
  const handleSuccess = () => {
    deleteTrigger({ playbook_id: playbook.id, triggerId: trigger.id });
  };

  useEffect(() => {
    if (isSuccess) {
      toggleOverlay();
      refreshTable();
    }
  }, [status]);

  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
          <div className={styles['actionOverlay']}>
            <header className="text-gray-500">Delete this trigger for {playbook.name}?</header>
            <div className={styles.actions}>
              <button className={styles['submitButton']} onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className={styles['submitButtonRight']}
                sx={{ marginLeft: '5px' }}
                onClick={handleSuccess}
              >
                Yes
              </button>
              {isLoading && (
                <CircularProgress
                  style={{
                    marginLeft: '12px'
                  }}
                  size={20}
                />
              )}
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default TriggerActionOverlay;
