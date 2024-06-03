import { Button } from "@mui/material";
import styles from "./styles.module.css";
import capitalizeFirstLetter from "../../../utils/capitalize";

function IntegrationCard({ data }) {
  const handleClick = () => {};

  return (
    <div key={data.id} className={styles["tabContainer"]}>
      <div
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          backgroundColor: "transparent",
        }}
        className="Integration_tabContainer__nK9yf">
        <div className={styles.card}>
          <div className="flex justify-between items-center">
            <img
              style={{ height: "25px", width: "25px" }}
              src={data.imgUrl}
              alt="alternatetext"
            />
          </div>
          <h1>{data.title}</h1>
          <h6 className={styles.desc}>{data.desc}</h6>
        </div>
      </div>

      <a
        href={
          data?.status === "request"
            ? "https://github.com/DrDroidLab/PlayBooks/issues/new"
            : data.buttonLink || `/integrations/${data.enum.toLowerCase()}`
        }
        target={data?.status === "request" ? "_blank" : "_self"}
        rel="noreferrer">
        <Button
          type="link"
          className={styles.buttonStyle}
          onClick={handleClick}>
          {capitalizeFirstLetter(data.buttonText.toLowerCase())}
        </Button>
      </a>
    </div>
  );
}

export default IntegrationCard;
