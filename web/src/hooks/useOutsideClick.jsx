/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

const useOutsideClick = (ref, callback) => {
  const handleClick = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, callback]);
};

export default useOutsideClick;
