import { useContext } from 'react';
import PrivateAxiosContext from '../context/PrivateAxiosProvider';

const useAxiosPrivate = () => {
  return useContext(PrivateAxiosContext);
};

export default useAxiosPrivate;
