import { useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";
import { connectors } from "../../../constants/connectors.ts";
import { ClickhouseAssets } from "./assets/ClickhouseAssets";
import TableSkeleton from "../..//Skeleton/TableLoader";
import { CloudwatchAssets } from "./assets/CloudwatchAssets.jsx";
import { DataDogAssets } from "./assets/DatadogAssets.jsx";
import { GrafanaAssets } from "./assets/GrafanaAssets.jsx";
import { NewRelicAssets } from "./assets/NewRelicAssests.jsx";
import { PostgresAssets } from "./assets/PostgresAssets.jsx";
import { useGetConnectorAssetsQuery } from "../../../store/features/integrations/api/index.ts";
import { EksClusterAssets } from "./assets/EksClusterAssets.jsx";
import { AzureAssets } from "./assets/AzureAssets.jsx";

function Assets() {
  const currentConnector = useSelector(connectorSelector);
  const vpcEnabled = currentConnector?.vpc?.status === "active";
  const { data, isFetching, error } = useGetConnectorAssetsQuery(
    vpcEnabled ? currentConnector?.vpc?.enum : currentConnector.enum,
  );

  if (isFetching) {
    return <TableSkeleton />;
  }
  if (error) {
    console.log(error);
    return <>There was an error: {error.message}</>;
  }
  const assets = data?.assets
    ? data?.assets[0][currentConnector.type?.toLowerCase()]?.assets
    : [];
  switch (currentConnector.type) {
    case connectors.CLICKHOUSE:
      return <ClickhouseAssets assets={assets} />;

    case connectors.POSTGRES:
      return <PostgresAssets assets={assets} />;

    case connectors.CLOUDWATCH:
      return <CloudwatchAssets assets={assets} />;

    case connectors.DATADOG:
      return <DataDogAssets assets={assets} />;

    case connectors.GRAFANA_VPC:
    case connectors.GRAFANA:
      return <GrafanaAssets assets={assets} />;

    case connectors.AZURE:
      return <AzureAssets assets={assets} />;

    case connectors.NEW_RELIC:
      return <NewRelicAssets assets={assets} />;

    case connectors.EKS:
      return <EksClusterAssets assets={assets} />;

    default:
      return <></>;
  }
}

export default Assets;
