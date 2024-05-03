import { useLocation } from "react-router-dom";

// Custom hook to determine if the user is not on the home page or if there is a theoretical previous page
function useHasPreviousPage(): boolean {
  const location = useLocation();

  // Check if the current path is not the root path '/'
  // If it is the root, return false, otherwise true
  // This implies if on the root, there's no "previous page" and if not on root, there likely is
  return location.pathname !== "/";
}

export default useHasPreviousPage;
