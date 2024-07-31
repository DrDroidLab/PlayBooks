/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { List, ListItemButton, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import "../../../src/Layout.css";
import { useLogoutMutation } from "../../store/features/auth/api";
import useToggle from "../../hooks/common/useToggle";
import SlackConnectOverlay from "../SlackConnectOverlay";
import VersionInfo from "./VersionInfo";
import { elements } from "./utils";
import SidebarElement from "./SidebarElement";
import { Settings } from "@mui/icons-material";

function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [triggerLogout] = useLogoutMutation();
  const { isOpen: isActionOpen, toggle } = useToggle();

  const signOut = async () => {
    await triggerLogout();
    navigate("/login");
  };

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (_, index) => {
    setSelectedIndex(index);

    switch (index) {
      case 1:
        setOpen(!open);
        break;
      case 4:
        toggle();
        break;
      default:
        break;
    }
  };

  // Active styling
  const activeStyle = ({ isActive }) => (isActive ? "activeNavLink" : "");

  return (
    <div className="sidebar1 w-full flex justify-between flex-col pb-2 relative">
      <div className="flex flex-col gap-0">
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

        <List sx={{ padding: 0 }}>
          {elements.map((element) => (
            <SidebarElement {...element} />
          ))}
        </List>
      </div>

      <List>
        <ListItemButton
          selected={selectedIndex === 4}
          onClick={(event) => handleListItemClick(event, 4)}
          sx={{
            display: "flex",
            justifyContent: "left",
          }}>
          <ListItemIcon
            sx={{
              minWidth: "34px",
            }}>
            <img
              src="/integrations/slack-logo.svg"
              alt="Slack Logo"
              style={{ width: "18px", marginLeft: "-5px" }}
            />
          </ListItemIcon>
          <p style={{ fontSize: "14px", flex: "1", width: "100%" }}>
            Join Slack Community
          </p>
        </ListItemButton>

        <NavLink className={activeStyle} to="/settings">
          <ListItemIcon sx={{ minWidth: "44px" }}>
            <Settings />
          </ListItemIcon>
          <p style={{ fontSize: "14px" }} className="sample_playbooks">
            Settings
          </p>
        </NavLink>

        <NavLink to={"#"}>
          <ListItemButton
            sx={{
              padding: 0,
              ":hover": {
                backgroundColor: "transparent",
              },
            }}
            onClick={signOut}>
            <ListItemIcon sx={{ minWidth: "44px" }}>
              <LogoutIcon />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }}>Logout</p>
          </ListItemButton>
        </NavLink>
      </List>

      <SlackConnectOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
}

export default Sidebar;
