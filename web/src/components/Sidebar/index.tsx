/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { List } from "@mui/material";
import { useLogoutMutation } from "../../store/features/auth/api";
import useToggle from "../../hooks/common/useToggle";
import SlackConnectOverlay from "../SlackConnectOverlay";
import { elements } from "./utils";
import SidebarElement from "./SidebarElement";
import { LogoutRounded, SettingsRounded } from "@mui/icons-material";
import SidebarButtonElement from "./SidebarButtonElement";
import HeadElement from "./HeadElement";

function Sidebar() {
  const navigate = useNavigate();
  const [triggerLogout] = useLogoutMutation();
  const { isOpen: isActionOpen, toggle } = useToggle();

  const signOut = async () => {
    await triggerLogout();
    navigate("/login");
  };

  return (
    <div className="sidebar w-full flex items-center justify-between flex-col pb-2">
      <div className="flex w-full flex-col gap-0">
        <HeadElement />

        <List sx={{ padding: 0 }}>
          {elements.map((element, index) => (
            <SidebarElement key={index} {...element} />
          ))}
        </List>
      </div>

      <List className="w-full">
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
          icon={<LogoutRounded />}
          onClick={signOut}
        />
      </List>

      <SlackConnectOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
}

export default Sidebar;
