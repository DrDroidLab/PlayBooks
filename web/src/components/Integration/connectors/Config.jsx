import styles from "./index.module.css";
import SlackManifestGenerator from "./SlackManifestGenerator.jsx";
import HandleKeyOptions from "./HandleKeyOptions.jsx";
import {
  connectorSelector,
  setKey,
} from "../../../store/features/integrations/integrationsSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { cardsData } from "../../../utils/cardsData.js";
import ConfigButtons from "./ConfigButtons.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function Config({ connector }) {
  const { id } = useParams();
  const connectorActive = id !== undefined && id !== null;
  const keyOptions = connector?.keys ?? [];
  const dispatch = useDispatch();
  const currentConnector = useSelector(connectorSelector);
  const cardData = cardsData.find((el) => el.enum === connector?.type);

  return (
    <>
      {connector.type === "SLACK" && <SlackManifestGenerator />}
      <div className={styles["container"]}>
        <div className={styles["heading"]}>
          <span>{connector?.display_name ?? connector?.type} Keys</span>
          {cardData?.docs && (
            <span>
              (
              <a
                className="text-violet-500 cursor-pointer"
                href={cardData?.docs}
                target="_blank"
                rel="noreferrer">
                Docs
              </a>
              )
            </span>
          )}
        </div>

        <>
          <div
            className={`${styles["eventTypeSelectionSection"]} flex items-center`}>
            <div className={styles["content"]}>Name</div>
            <CustomInput
              inputType={InputTypes.TEXT}
              handleChange={(val) => {
                dispatch(setKey({ key: "name", value: val }));
              }}
              disabled={connectorActive}
              value={currentConnector.name}
              placeholder={"Enter connector name"}
              length={500}
            />
          </div>
          {keyOptions?.map((option, i) => (
            <div
              key={i}
              className={`${styles["eventTypeSelectionSection"]} flex items-center`}>
              <div className={styles["content"]}>
                {option?.display_name || option?.key_type}
              </div>
              <HandleKeyOptions
                connectorActive={connectorActive}
                option={option}
              />
            </div>
          ))}
        </>
      </div>

      <ConfigButtons connector={connector} />
    </>
  );
}

export default Config;
