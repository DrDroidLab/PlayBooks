/* eslint-disable react-hooks/exhaustive-deps */
import { CircularProgress, Tab, Tabs } from "@mui/material";
import Heading from "../../components/Heading.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectorSelector,
  resetIntegrationState,
  setCurrentConnector,
} from "../../store/features/integrations/integrationsSlice.ts";
import { useNavigate, useParams } from "react-router-dom";
import Config from "../../components/Integration/connectors/Config.jsx";
import TabPanel from "../../components/Integration/connectors/TabPanel.jsx";
import Assets from "../../components/Integration/connectors/Assets.jsx";
import { connectorsWithoutAssets } from "../../utils/connectorsWithoutAssets.ts";
import { unsupportedConnectors } from "../../utils/unsupportedConnectors.ts";
import {
  useGetConnectorKeyOptionsQuery,
  useLazyGetConnectorKeysQuery,
} from "../../store/features/integrations/api/index.ts";
import { ChevronLeft } from "@mui/icons-material";
import GoogleChatIntegration from "../../components/Integration/connectors/GoogleChatIntegration.jsx";

function ConnectorPageBeta() {
  const { id, connectorEnum } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const currentConnector = useSelector(connectorSelector);
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: connector, isFetching: optionsLoading } =
    useGetConnectorKeyOptionsQuery(connectorEnum ?? "");
  const [triggerGetKeys, { isFetching: keysLoading }] =
    useLazyGetConnectorKeysQuery();

  useEffect(() => {
    if (id !== null && id !== undefined) {
      dispatch(setCurrentConnector(id));
      triggerGetKeys(id);
    }
  }, [id]);

  useEffect(() => {
    return () => {
      dispatch(resetIntegrationState());
    };
  }, [dispatch]);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const containsAssets = !connectorsWithoutAssets.includes(
    connectorEnum?.toUpperCase() ?? "",
  );

  const isActive = currentConnector?.is_active;

  switch (id) {
    case unsupportedConnectors.GOOGLE_CHAT:
      return <GoogleChatIntegration />;
    default:
      break;
  }

  if (optionsLoading || keysLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Heading
        heading={`${
          connector?.display_name ?? currentConnector?.type
        } Integration Setup`}
      />

      <button
        onClick={() => navigate("/data-sources")}
        className="p-1 text-sm border border-violet-500 rounded m-2 text-violet-500 flex items-center cursor-pointer hover:text-white hover:bg-violet-500 transition-all">
        <ChevronLeft /> All Integrations
      </button>

      {isActive && (
        <Tabs className="mx-2" value={selectedTab} onChange={handleTabChange}>
          <Tab label="Config" id="tab-0" aria-controls="tabpanel-0" />
          {containsAssets && (
            <Tab label="Assets" id="tab-1" aria-controls="tabpanel-1" />
          )}
        </Tabs>
      )}

      <TabPanel value={selectedTab} index={0}>
        <Config connector={connector} />
      </TabPanel>

      {isActive && containsAssets && (
        <TabPanel value={selectedTab} index={1}>
          <Assets connector={connector} id={id} />
        </TabPanel>
      )}
    </div>
  );
}

export default ConnectorPageBeta;
