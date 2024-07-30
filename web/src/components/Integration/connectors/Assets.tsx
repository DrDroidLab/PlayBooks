import { connectors } from "../../../constants/connectors";
import { ClickhouseAssets } from "./assets/ClickhouseAssets";
import TableSkeleton from "../../Skeleton/TableLoader";
import { CloudwatchAssets } from "./assets/CloudwatchAssets";
import { DataDogAssets } from "./assets/DatadogAssets";
import { NewRelicAssets } from "./assets/NewRelicAssests";
import { PostgresAssets } from "./assets/PostgresAssets";
import { useGetConnectorAssetsQuery } from "../../../store/features/integrations/api";
import { EksClusterAssets } from "./assets/EksClusterAssets";
import { AzureAssets } from "./assets/AzureAssets";
import { GkeAssets } from "./assets/GkeAssets";
import { ElasticSearchAssets } from "./assets/ElasticSearch";

function Assets({ connector, id }) {
  const { data, isFetching, error } = useGetConnectorAssetsQuery(id);

  if (isFetching) {
    return <TableSkeleton />;
  }
  if (error) {
    console.log(error);
    return <>There was an error: {error.message}</>;
  }
  const assets = data?.assets
    ? data?.assets[0][connector.type?.toLowerCase()]?.assets
    : [];
  switch (connector.type) {
    case connectors.CLICKHOUSE:
      return <ClickhouseAssets assets={assets} />;

    case connectors.POSTGRES:
      return <PostgresAssets assets={assets} />;

    case connectors.CLOUDWATCH:
      return <CloudwatchAssets assets={assets} />;

    case connectors.DATADOG:
      return <DataDogAssets assets={assets} />;

    case connectors.AZURE:
      return <AzureAssets assets={assets} />;

    case connectors.NEW_RELIC:
      return <NewRelicAssets assets={assets} />;

    case connectors.EKS:
      return <EksClusterAssets assets={assets} />;

    case connectors.GKE:
      return <GkeAssets assets={assets} />;

    case connectors.ELASTIC_SEARCH:
      return <ElasticSearchAssets assets={assets} />;

    default:
      return <></>;
  }
}

export default Assets;
