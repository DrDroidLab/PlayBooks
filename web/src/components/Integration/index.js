import TabContent from '../TabsComponent/TabContent';
import styles from './index.module.css';
import Heading from '../Heading';
import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';
import { useGetConnectorListQuery } from '../../store/features/integrations/api/index.ts';

function Integrations() {
  const { data: integrations, isFetching } = useGetConnectorListQuery();

  return (
    <>
      <Heading heading={'Integrations'} onTimeRangeChangeCb={false} onRefreshCb={false} />
      <SuspenseLoader loading={isFetching} loader={<TableSkeleton noOfLines={7} />}>
        {Object.entries(integrations?.integrations ?? {})?.map(
          (integration, i) =>
            integration[0] !== 'allAvailableConnectors' && (
              <TabContent
                key={i}
                id={integration[0]}
                title={integration[0] ?? ''}
                cards={integration[1]}
              />
            )
        )}
        <h1 className={styles['intercom-text']}>
          Looking for any other integration? Chat with us or{' '}
          <a
            className={styles['meeting-link']}
            href="https://calendly.com/dipesh-droid/integrations"
            target="_blank"
            rel="noreferrer"
          >
            setup a meeting
          </a>{' '}
          with our team or email us at <b className={styles['meeting-link']}>dipesh@drdroid.io</b>
        </h1>
      </SuspenseLoader>
    </>
  );
}

export default Integrations;
