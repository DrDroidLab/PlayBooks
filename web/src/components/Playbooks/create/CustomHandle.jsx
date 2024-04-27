// CustomHandle.js

import React from 'react';

const CustomHandle = ({ type, position }) => {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: type === 'source' ? 'blue' : 'red',
        border: '2px solid white',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 99,
        left: position.x,
        top: position.y
      }}
    />
  );
};

export default CustomHandle;
