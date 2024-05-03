import React from "react";
import Overlay from "../Overlay";
import styles from "./index.module.css";

// function convertStringToArray(inputString) {
//   let stringArray = inputString.split(",");

//   for (let i = 0; i < stringArray.length; i++) {
//     let trimmedString = stringArray[i].trim();

//     if (trimmedString.indexOf("@") === -1) {
//       return false;
//     }

//     stringArray[i] = trimmedString;
//   }

//   return stringArray;
// }

const InviteUserOverlay = ({ isOpen, toggleOverlay }) => {
  // const [loading, setLoading] = useState(false);
  // const [emails, setEmails] = useState("");
  // const [triggerInviteUsers] = useInviteUsersMutation();

  // const handleSuccess = async () => {
  //   setLoading(true);

  //   const emailList = convertStringToArray(emails);
  //   if (!emailList) {
  //     alert("Please enter valid emails separated by comma");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await triggerInviteUsers({ emailList }).unwrap();
  //     alert(response.message.title);
  //   } catch (e) {
  //     console.log(e);
  //   }

  //   toggleOverlay();
  // };

  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
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
              {/* {loading ? (
                <CircularProgress
                  style={{
                    marginLeft: "12px",
                    marginBottom: "12px",
                  }}
                  size={20}
                />
              ) : (
                ""
              )} */}
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default InviteUserOverlay;
