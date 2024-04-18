/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import ValueComponent from '../../ValueComponent';
import styles from './index.module.css';
import {
  useGetAgentKeyOptionsQuery,
  useLazyGetAgentKeysQuery
} from '../../../store/features/integrations/api/index.ts';
import { connectors } from '../../../constants/connectors.ts';
import { CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  agentProxySelector,
  setAgentProxyKey
} from '../../../store/features/integrations/integrationsSlice.ts';

function AgentProxy() {
  const { data: keyOptions, isLoading } = useGetAgentKeyOptionsQuery(connectors.AGENT_PROXY);
  const agentProxy = useSelector(agentProxySelector);
  const [triggerGetConnectorsKey, { isLoading: keysLoading }] = useLazyGetAgentKeysQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (agentProxy.is_active) {
      triggerGetConnectorsKey(agentProxy?.id);
    }
  }, [agentProxy.id]);

  if (keysLoading || isLoading) {
    return (
      <div className="flex items-center justify-center">
        <CircularProgress size={20} />
      </div>
    );
  }

  return (
    <div className={styles['container']}>
      <div className={styles['heading']}>Agent Proxy Keys</div>

      {keyOptions?.map((option, i) => (
        <div key={i} className={styles['eventTypeSelectionSection']}>
          <div className={styles['content']}>{option?.display_name || option?.key_type}</div>
          <ValueComponent
            valueType={'STRING'}
            onValueChange={val => {
              dispatch(setAgentProxyKey({ key: option.key_type, value: val }));
            }}
            disabled={agentProxy.is_active}
            value={agentProxy[option.key_type]}
            placeHolder={option.display_name}
            length={500}
          />
        </div>
      ))}
    </div>
  );
}

export default AgentProxy;
