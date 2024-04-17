import { useEffect, useState } from 'react';

function useKeyPressed() {
  const [keyPressed, setKeyPressed] = useState(false);
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Control' || event.key === 'Meta') {
        setKeyPressed(true);
      }
    }

    function handleKeyUp(event) {
      if (event.key === 'Control' || event.key === 'Meta') {
        setKeyPressed(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keyPressed;
}

export default useKeyPressed;
