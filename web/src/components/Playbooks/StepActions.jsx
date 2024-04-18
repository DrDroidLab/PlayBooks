import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import API from '../../API';
import SaveIcon from '@mui/icons-material/Save';
import styles from './playbooks.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  addStep,
  playbookSelector,
  setLastUpdatedAt
} from '../../store/features/playbook/playbookSlice.ts';
import { stepsToPlaybook } from '../../utils/stepsToplaybook.ts';
import SavePlaybookOverlay from './SavePlaybookOverlay.jsx';
// import Toast from '../Toast.js';
import { useNavigate } from 'react-router-dom';
import { useUpdatePlaybookMutation } from '../../store/features/playbook/api/updatePlaybookApi.ts';
import { renderTimestamp } from '../../utils/DateUtils.js';

function StepActions({ allowSave }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { steps, isEditing, lastUpdatedAt } = useSelector(playbookSelector);
  const playbookVal = useSelector(playbookSelector);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavePlaybookOverlayOpen, setIsSavePlaybookOverlayOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  // const [validationError, setValidationError] = useState('');
  const savePlaybook = API.useSavePlaybook();
  const [triggerUpdatePlaybook] = useUpdatePlaybookMutation();

  const handleAddCard = () => {
    dispatch(addStep());
  };

  const handleSave = () => {
    // if (!playbookVal.name) {
    // setValidationError('Please enter a name');
    // return;
    // }
    // Perform API call to save the configuration
    setIsSavePlaybookOverlayOpen(true);
  };

  const handlePlaybookSave = ({ pbName }) => {
    setIsSavePlaybookOverlayOpen(false);
    setSaveLoading(true);

    const playbook = stepsToPlaybook(playbookVal, steps);

    const playbookObj = {
      playbook: {
        ...playbook,
        name: pbName
      }
    };

    savePlaybook(
      playbookObj,
      res => {
        setSaveLoading(false);
        setIsSaved(true);
        navigate(`/playbooks/edit/${res?.data?.playbook?.id}`);
      },
      err => {
        console.error(err);
        setSaveLoading(false);
      }
    );
  };

  const handlePlaybookUpdate = async () => {
    setIsSavePlaybookOverlayOpen(false);
    setSaveLoading(true);

    const playbook = stepsToPlaybook(playbookVal, steps);

    try {
      await triggerUpdatePlaybook({ ...playbook, id: playbookVal.id }).unwrap();
      dispatch(setLastUpdatedAt());
    } catch (e) {
      console.log(e);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div
      style={{ marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}
      className="flex items-center"
    >
      <button className={`${styles['pb-button']} add_step`} onClick={handleAddCard}>
        + Add Step
      </button>
      {steps && steps?.length > 0 && (
        <>
          {allowSave && (
            <button className={styles['pb-button']} onClick={handleSave}>
              <SaveIcon style={{ fontSize: 'medium' }} />
              <span style={{ marginLeft: '2px' }} className="save_playbook">
                Save
              </span>
            </button>
          )}
          {isEditing && (
            <button className={styles['pb-button']} onClick={handlePlaybookUpdate}>
              <SaveIcon style={{ fontSize: 'medium' }} />
              <span style={{ marginLeft: '2px' }}>Update</span>
            </button>
          )}
          {saveLoading && (
            // <div style={{ textAlign: 'center' }}>
            <CircularProgress
              style={{
                textAlign: 'center'
              }}
              size={20}
            />
            // </div>
          )}
          {lastUpdatedAt && !saveLoading && (
            <i className="text-sm text-gray-400">
              Last updated at: {renderTimestamp(lastUpdatedAt / 1000)}
            </i>
          )}
          {isSaved && (
            <div style={{ textAlign: 'center' }}>
              <p>Playbook saved!!</p>
            </div>
          )}
        </>
      )}

      <SavePlaybookOverlay
        isOpen={isSavePlaybookOverlayOpen}
        close={() => setIsSavePlaybookOverlayOpen(false)}
        saveCallback={isEditing ? handlePlaybookUpdate : handlePlaybookSave}
      />
      {/* <Toast
        open={validationError}
        severity="error"
        message={validationError}
        handleClose={() => setValidationError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      /> */}
    </div>
  );
}

export default StepActions;
