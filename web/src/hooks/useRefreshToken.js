import useAuth from './useAuth';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/features/auth/authSlice.ts';

const useRefreshToken = () => {
  const { setAuth, auth } = useAuth();
  const dispatch = useDispatch();

  const refresh = async () => {
    const response = await axios.post('/accounts/token/refresh/', {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    setAuth({ ...auth, accessToken: response.data?.access });
    dispatch(setCredentials({ accessToken: response.data?.access }));
    return response.data?.access;
  };

  return refresh;
};

export default useRefreshToken;
