import React from "react";
import Overlay from "../../components/Overlay";
import styles from "./index.module.css";

const InviteUserOverlay = ({ isOpen, toggleOverlay }) => {
  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <header className="text-gray-500">
              Share the current URL with your team members to invite them. They
              will be able to access the dashboard with the same permissions as
              you.
            </header>

            <div className={styles["actions"]}>
              <button
                className={styles["submitButton"]}
                onClick={toggleOverlay}>
                Ok
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default InviteUserOverlay;
