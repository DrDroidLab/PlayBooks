import { Link } from "react-router-dom";
import VersionInfo from "./VersionInfo";

function HeadElement() {
  return (
    <div className="py-2 px-2 border-b border-gray-300 bg-white h-[80px] flex items-center justify-center flex-col">
      <Link style={{ padding: "0px", paddingTop: "1rem" }} to="/">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src="/logo/drdroid-logo-full.png"
            alt="Logo"
            style={{ width: "150px" }}
            className="main_logo_option"
          />
        </div>
      </Link>
      <VersionInfo />
    </div>
  );
}

export default HeadElement;
