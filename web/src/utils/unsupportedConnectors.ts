import { connectors } from '../constants/connectors.ts';

export const unsupportedConnectors = {
  NEW_RELIC: connectors.NEW_RELIC.toLowerCase(),
  SLACK: connectors.SLACK.toLowerCase()
};
