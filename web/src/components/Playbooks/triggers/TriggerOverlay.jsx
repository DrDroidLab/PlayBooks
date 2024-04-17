import styles from './index.module.css';
import Overlay from '../../Overlay';

const TriggerOverlay = ({ isOpen, close, saveCallback, numberOfAlerts }) => {
  const handleSubmit = () => {
    saveCallback();
    close();
  };

  return (
    <>
      <Overlay visible={isOpen}>
        <div
          className={styles['dashboardSaveOverlay']}
          style={{ maxWidth: '400px', margin: 'auto' }}
        >
          <div className={styles['dashboardSaveOverlay__content']}>
            <div className={styles['panel__description']}>Save this trigger?</div>
            <p className=" text-sm">
              This search criteria matched with {numberOfAlerts} alerts in the past 3 days. You will
              recieve playbook notifications for all of them. Are you sure you want to continue?
            </p>
          </div>
          <div className={styles['actions']}>
            <button className={styles['submitButton']} onClick={() => close()}>
              Cancel
            </button>

            <button
              className={styles['submitButton']}
              onClick={handleSubmit}
              style={{
                marginLeft: '12px'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
};

export default TriggerOverlay;
