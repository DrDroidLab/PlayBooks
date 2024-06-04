/* eslint-disable react-hooks/exhaustive-deps */
import { React, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { List, ListItemButton, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SlackConnectOverlay from "./SlackConnectOverlay";
import useToggle from "./hooks/useToggle";
import "../src/Layout.css";
import { Key, Layers, SlowMotionVideo, Terminal } from "@mui/icons-material";
import { useLogoutMutation } from "./store/features/auth/api/index.ts";

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
    <div
      className="sidebar1 w-full"
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        position: "relative",
        paddingBottom: "10px",
      }}>
      <div className="flex flex-col gap-0">
        <div className="py-2 px-2 border-b border-gray-300 bg-white h-[80px] flex items-center justify-center">
          <Link to="/">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/logo/drdroid-logo-full.png"
                alt="Logo"
                style={{ width: "100px" }}
                className="main_logo_option"
              />
            </div>
          </Link>
        </div>

        <List sx={{ padding: 0 }}>
          <NavLink className={activeStyle} to="/">
            <ListItemIcon
              sx={{ minWidth: "44px" }}
              onClick={(event) => handleListItemClick(event, 6)}>
              <CollectionsBookmarkIcon />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }} className="playbook_page">
              Playbooks
            </p>
          </NavLink>
          <NavLink className={activeStyle} to="/workflows">
            <ListItemIcon
              sx={{ minWidth: "44px" }}
              onClick={(event) => handleListItemClick(event, 6)}>
              <Layers />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }} className="workflows_page">
              Workflows
            </p>
          </NavLink>
          <NavLink className={activeStyle} to="/executions/list">
            <ListItemIcon
              sx={{ minWidth: "44px" }}
              onClick={(event) => handleListItemClick(event, 9)}>
              <SlowMotionVideo />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }}>All Executions</p>
          </NavLink>
          <NavLink className={activeStyle} to="/playgrounds">
            <ListItemIcon
              sx={{ minWidth: "44px" }}
              onClick={(event) => handleListItemClick(event, 7)}>
              <Terminal />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }} className="sample_playbooks">
              Sample Playbooks
            </p>
          </NavLink>
          <NavLink className={activeStyle} to="/data-sources">
            <ListItemIcon
              sx={{ minWidth: "44px" }}
              onClick={(event) => handleListItemClick(event, 2)}>
              <DataThresholdingIcon />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }}>Data Sources</p>
          </NavLink>
          <hr></hr>

          <NavLink className={activeStyle} to="/api-keys">
            <ListItemIcon sx={{ minWidth: "44px" }}>
              <Key />
            </ListItemIcon>
            <p style={{ fontSize: "14px" }}>API keys</p>
          </NavLink>
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

        <NavLink to="/invite-team">
          <ListItemButton
            selected={selectedIndex === 3}
            onClick={(event) => handleListItemClick(event, 3)}
            sx={{
              padding: 0,
              ":hover": {
                backgroundColor: "transparent",
              },
            }}>
            <ListItemIcon sx={{ minWidth: "44px" }}>
              <GroupAddIcon />
            </ListItemIcon>
            <p style={{ fontSize: "14px", width: "100%" }}>Team</p>
          </ListItemButton>
        </NavLink>

        <NavLink>
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
