import React from 'react';
import ValueComponent from '../ValueComponent';
import EditIcon from '@mui/icons-material/Edit';
import { CircularProgress } from '@mui/material';
import { Check, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

function PlaybookTitle({ step, index, updateCardByIndex }) {
  const editCardTitle = (e, index) => {
    e.stopPropagation();
    updateCardByIndex(index, 'editTitle', true);
  };

  const cancelEditCardTitle = (e, index) => {
    e.stopPropagation();
    updateCardByIndex(index, 'editTitle', false);
  };

  return (
    <>
      <p style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {step.isPrefetched && !step.isCopied && (
          <b>
            {index + 1}: {step.description || `Step - ${index + 1}`}
          </b>
        )}

        {(step.outputLoading || step.inprogress) && <CircularProgress size={20} />}
        {(step.outputError || step.showError) && <ErrorOutline color="error" size={20} />}
        {!step.outputError &&
          !step.outputLoading &&
          step.showOutput &&
          step.output &&
          !step.showError && <CheckCircleOutline color="success" size={20} />}

        {!step.editTitle && (!step.isPrefetched || step.isCopied) && (
          <div onClick={e => editCardTitle(e, index)}>
            <b>
              {index + 1}: {step.description || `Step - ${index + 1}`}
            </b>
            <button>
              <EditIcon sx={{ zIndex: '10' }} fontSize={'small'} style={{ marginLeft: '5px' }} />
            </button>
          </div>
        )}
      </p>{' '}
      {step.editTitle && (
        <div className="flex items-center">
          <ValueComponent
            placeHolder={`Enter Title`}
            valueType={'STRING'}
            onValueChange={val => {
              updateCardByIndex(index, 'description', val);
            }}
            value={step.description}
            length={200}
          />
          <Check onClick={e => cancelEditCardTitle(e, index)} style={{ marginLeft: '8px' }} />
        </div>
      )}
    </>
  );
}

export default PlaybookTitle;
