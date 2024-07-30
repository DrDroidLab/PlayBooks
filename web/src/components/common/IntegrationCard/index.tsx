import styles from "./styles.module.css";
import capitalizeFirstLetter from "../../../utils/common/capitalize";
import CustomButton from "../CustomButton";

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
            : `/data-sources/${data.enum.toLowerCase()}`
        }
        target={data?.status === "request" ? "_blank" : "_self"}
        rel="noreferrer">
        <CustomButton
          className="w-full rounded-none rounded-b !text-base justify-center border-none !bg-gray-100 py-2 hover:!bg-violet-500"
          onClick={handleClick}>
          {capitalizeFirstLetter(data.buttonText.toLowerCase())}
        </CustomButton>
      </a>
    </div>
  );
}

export default IntegrationCard;
