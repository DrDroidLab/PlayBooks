import { Link } from "react-router-dom";
import VersionInfo from "./VersionInfo";
import useSidebar from "../../hooks/common/sidebar/useSidebar";
import ToggleButton from "./ToggleButton";

function HeadElement() {
  const { isOpen } = useSidebar();

  return (
    <div
      className={`flex border-b border-gray-300 items-center justify-center ${
        isOpen ? "flex-row h-[80px]" : "flex-col-reverse"
      } overflow-hidden`}>
      <div className="py-2 px-2 bg-white flex items-center justify-center flex-col flex-1 max-h-full">
        <Link className="hover:!bg-transparent" to="/">
          <img
            src={isOpen ? "/logo/drdroid-logo-full.png" : "/logo/logo.png"}
            alt="Logo"
            className="main_logo_option w-40"
          />
        </Link>
        <VersionInfo />
      </div>
      <ToggleButton />
    </div>
  );
}

export default HeadElement;
