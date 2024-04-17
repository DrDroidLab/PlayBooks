/* eslint-disable react-hooks/exhaustive-deps */
import { React, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import API from './API';

import SlackIcon from './data/slack.png';

import AssessmentIcon from '@mui/icons-material/Assessment';
import SlackConnectOverlay from './SlackConnectOverlay';
import useToggle from './hooks/useToggle';

import logo from './data/black_logo.png';
import useLogout from './hooks/useLogout';
import '../src/Layout.css';
import { Key, Terminal } from '@mui/icons-material';
import { useGetConnectorListQuery } from './store/features/integrations/api/index.ts';
import { CircularProgress } from '@mui/material';
import useAuth from './hooks/useAuth.js';

function Sidebar() {
  const navigate = useNavigate();
  const logout = useLogout();
  const { auth } = useAuth();
  const { data: integrations, isFetching } = useGetConnectorListQuery();
  const slackConnectorExists =
    integrations?.integrations?.allAvailableConnectors?.find(
      integration => integration.title === 'SLACK'
    ).status === 'active';

  const [open, setOpen] = useState(false);

  const [alertTypes, setAlertTypes] = useState([]);

  const alertOptions = API.useGetAlertOptions();

  useEffect(() => {
    if (!auth.accessToken) return;
    alertOptions(
      {
        connector_type_requests: [
          {
            connector_type: 'SLACK'
          },
          {
            connector_type: 'GOOGLE_CHAT'
          }
        ]
      },
      res => {
        const data = res?.data;
        const { alert_ops_options } = data;
        const { comm_options } = alert_ops_options;
        const { workspaces } = comm_options;
        const { alert_types } = workspaces[0];
        if (alert_types) {
          const filteredAlertTypes = alert_types
            .filter(
              (value, index, self) =>
                index === self.findIndex(t => t.alert_type === value.alert_type)
            )
            .map(alertType => {
              return alertType.alert_type;
            })
            .filter(
              alertType =>
                [
                  'New Relic',
                  'Sentry',
                  'Datadog',
                  'Prometheus_AlertManager',
                  'Robusta',
                  'Grafana',
                  'Cloudwatch',
                  'Coralogix'
                ].indexOf(alertType) >= 0
            );
          setAlertTypes(filteredAlertTypes);
        }
      },
      err => {
        console.error(err);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isOpen: isActionOpen, toggle } = useToggle();

  const signOut = async () => {
    await logout();
    navigate('/login');
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

  const handleAlertTypeItemClick = (alert_type, index) => {
    setSelectedIndex(index);

    navigate('/at-insights/' + alert_type);
  };

  // Active styling
  const activeStyle = ({ isActive }) => (isActive ? 'activeNavLink' : '');

  return (
    <div
      className="sidebar1 w-full"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '10px'
      }}
    >
      <div className="flex flex-col gap-0">
        <div className="py-2 px-2 border-b border-gray-300 bg-white h-[80px] flex items-center justify-center">
          <Link to="/" className="logo">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={logo} alt="Logo" style={{ width: '100px' }} className="main_logo_option" />
            </div>
          </Link>
        </div>

        <List sx={{ padding: 0 }}>
          <NavLink className={activeStyle} exact to="/playbooks">
            <ListItemIcon
              sx={{ minWidth: '44px' }}
              onClick={event => handleListItemClick(event, 6)}
            >
              <CollectionsBookmarkIcon />
            </ListItemIcon>
            <p style={{ fontSize: '14px' }} className="playbook_page">
              Playbooks
            </p>
          </NavLink>
          <NavLink className={activeStyle} exact to="/playgrounds">
            <ListItemIcon
              sx={{ minWidth: '44px' }}
              onClick={event => handleListItemClick(event, 7)}
            >
              <Terminal />
            </ListItemIcon>
            <p style={{ fontSize: '14px' }} className="sample_playbooks">
              Sample Playbooks
            </p>
          </NavLink>
          <NavLink className={activeStyle} exact to="/integrations">
            <ListItemIcon
              sx={{ minWidth: '44px' }}
              onClick={event => handleListItemClick(event, 2)}
            >
              <DataThresholdingIcon />
            </ListItemIcon>
            <p style={{ fontSize: '14px' }}>Integrations</p>
          </NavLink>
          <hr></hr>
          <NavLink
            className={activeStyle}
            exact
            to={slackConnectorExists ? '/alert-insights' : '/sample-insights'}
          >
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={event => handleListItemClick(event, 1)}
              sx={{
                padding: 0,
                ':hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: '44px' }}>
                <AssessmentIcon />
              </ListItemIcon>
              <p style={{ fontSize: '14px' }}>Alert Insights</p>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {isFetching ? (
                <CircularProgress color="primary" size={20} />
              ) : slackConnectorExists && open ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </ListItemButton>
          </NavLink>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {alertTypes.map((alert_type, index) => (
                <NavLink
                  key={index}
                  className={activeStyle}
                  exact
                  to={`/at-insights/${alert_type}`}
                >
                  <ListItemButton
                    selected={selectedIndex === `${index}-sub`}
                    key={index}
                    onClick={_ => handleAlertTypeItemClick(alert_type, `${index}-sub`)}
                    sx={{
                      padding: 0,
                      ':hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <div
                      key={index}
                      style={{
                        display: 'flex'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '5px' }}></ListItemIcon>
                      <ListItemIcon sx={{ minWidth: '44px' }}>
                        <KeyboardArrowRightIcon />
                      </ListItemIcon>
                      <p style={{ fontSize: '14px' }}>{alert_type}</p>
                    </div>
                  </ListItemButton>
                </NavLink>
              ))}
            </List>
          </Collapse>

          <NavLink className={activeStyle} exact to="/api-keys">
            <ListItemIcon sx={{ minWidth: '44px' }}>
              <Key />
            </ListItemIcon>
            <p style={{ fontSize: '14px' }}>API keys</p>
          </NavLink>
        </List>
      </div>

      <List>
        <ListItemButton
          selected={selectedIndex === 4}
          onClick={event => handleListItemClick(event, 4)}
          sx={{
            display: 'flex',
            justifyContent: 'left'
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: '34px'
            }}
          >
            <img src={SlackIcon} alt="Slack Logo" style={{ width: '18px', marginLeft: '-5px' }} />
          </ListItemIcon>
          <p style={{ fontSize: '14px', flex: '1', width: '100%' }}>Connect on Slack</p>
        </ListItemButton>

        <NavLink exact to="/invite-team">
          <ListItemButton
            selected={selectedIndex === 3}
            onClick={event => handleListItemClick(event, 3)}
            sx={{
              padding: 0,
              ':hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: '44px' }}>
              <GroupAddIcon />
            </ListItemIcon>
            <p style={{ fontSize: '14px', width: '100%' }}>Invite Team</p>
          </ListItemButton>
        </NavLink>

        <NavLink>
          <ListItemButton
            sx={{
              padding: 0,
              ':hover': {
                backgroundColor: 'transparent'
              }
            }}
            onClick={signOut}
          >
            <ListItemIcon sx={{ minWidth: '44px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <p style={{ fontSize: '14px' }}>Logout</p>
          </ListItemButton>
        </NavLink>
      </List>

      <SlackConnectOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
}

export default Sidebar;
