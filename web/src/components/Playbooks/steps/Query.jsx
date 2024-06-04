/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import PlaybookStep from "./PlaybookStep";
import styles from "../playbooks.module.css";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";
import AddSource from "./AddSource.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function Query({ index }) {
  const [step, currentStepIndex] = useCurrentStep(index);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (step?.isPrefetched) {
      fetchData({ index: currentStepIndex });
    }
  }, [step?.isPrefetched]);

  return (
    <div className={styles["step-fields"]}>
      <div
        style={{
          display: "flex",
          marginTop: "5px",
          position: "relative",
        }}>
        <div className="flex items-center gap-2">
          <AddSource index={index} />
        </div>
      </div>

      {step?.source && <PlaybookStep index={index} />}
      <CustomDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        src={"/data-sources/add"}
      />
    </div>
  );
}

export default Query;
