import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../store/features/auth/api";
import useToggle from "../../hooks/common/useToggle";
import SlackConnectOverlay from "../SlackConnectOverlay";
import { elements } from "./utils";
import SidebarElement from "./SidebarElement";
import {
  LogoutRounded,
  SettingsRounded,
  MenuRounded,
  CloseRounded,
} from "@mui/icons-material";
import SidebarButtonElement from "./SidebarButtonElement";
import HeadElement from "./HeadElement";
import useSidebar from "../../hooks/common/sidebar/useSidebar";
import ToggleButton from "./ToggleButton";

function Sidebar() {
  const navigate = useNavigate();
  const [triggerLogout] = useLogoutMutation();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const { isOpen, toggle: toggleSidebar } = useSidebar();

  const signOut = async () => {
    await triggerLogout();
    navigate("/login");
  };

  return (
    <div
      className={`relative flex items-center justify-between flex-col pb-2 ${
        isOpen ? "w-64" : "w-16"
      } transition-width duration-300`}>
      <div className="flex w-full flex-col gap-0">
        <ToggleButton />
        <HeadElement />

        <div className="flex flex-col gap-2 my-1">
          {elements.map((element, index) => (
            <SidebarElement key={index} {...element} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <SidebarButtonElement
          label="Join Slack Community"
          icon={
            <img
              src="/integrations/slack-logo.svg"
              alt="Slack Logo"
              width={18}
            />
          }
          onClick={toggle}
        />
        <SidebarElement
          to="/settings"
          label="Settings"
          icon={<SettingsRounded />}
        />
        <SidebarButtonElement
          label="Logout"
          icon={<LogoutRounded fontSize="small" />}
          onClick={signOut}
        />
      </div>

      <SlackConnectOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
}

export default Sidebar;
