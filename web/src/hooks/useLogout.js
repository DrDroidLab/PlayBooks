import useAuth from './useAuth';
import axios from 'axios';
import posthog from 'posthog-js';

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});
    localStorage.removeItem('email');
    posthog.reset();
    try {
      await axios.post('/accounts/logout/', '', {
        withCredentials: true
      });
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
