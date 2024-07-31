import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const onBackClick = () => navigate("/");

  return (
    <div className={styles.notFoundContainer}>
      <img
        src={"/icons/error_screen_icon.svg"}
        alt="404 not found"
        className={styles["animate"]}
      />
      <div>Page Not Found</div>
      <button onClick={onBackClick}>Go to Home</button>
    </div>
  );
};

export default NotFound;
