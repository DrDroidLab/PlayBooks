import { ALL_CONNECTORS } from '../../../../constants/api.ts';
import { connectors } from '../../../../constants/connectors.ts';
import { cardsData } from '../../../../utils/cardsData.js';
import { apiSlice } from '../../../app/apiSlice.ts';
import { setAgentProxy, setIntegrations, setVpcConnectors } from '../integrationsSlice.ts';
import {
  AllConnectorsResponse,
  CardData,
  IntegrationStatus,
  IntegrationType,
  Integrations
} from '../types/index.ts';

const unsupportedConnectorTypes = ['DATADOG_OAUTH', 'AGENT_PROXY'];

export const getConnectorListApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getConnectorList: builder.query<Integrations, void>({
      query: () => ({
        url: ALL_CONNECTORS,
        method: 'POST'
      }),
      providesTags: ['Integrations'],
      transformResponse: (response: AllConnectorsResponse) => {
        const integrations: IntegrationType = {};
        const allAvailableConnectors: CardData[] = [];
        const vpcConnectors: any = [];
        let agentProxy: any = {};

        for (let integration of response?.request_connectors ?? []) {
          if (integration.type === connectors.AGENT_PROXY) agentProxy = integration;
          if (unsupportedConnectorTypes.includes(integration.type)) continue;
          if (integration.type.includes('VPC')) {
            vpcConnectors.push({
              title: integration.display_name,
              enum: integration.type,
              status: IntegrationStatus.REQUEST
            });
            continue;
          }
          const card = cardsData.find(e => e.enum === integration.type);
          const cardData: CardData = {
            title: integration.display_name,
            buttonLink: card?.buttonLink ?? '',
            buttonText: 'Request Access',
            desc: card?.desc ?? '',
            imgUrl: card?.url ?? '',
            enum: integration.type,
            docs: card?.docs,
            status: IntegrationStatus.REQUEST
          };
          integrations[integration.category] = integrations[integration.category] || []; // Check if the key exists, if not create an empty array
          integrations[integration.category].push(cardData);
        }

        for (let integration of response?.available_connectors ?? []) {
          if (integration.type === connectors.AGENT_PROXY) agentProxy = integration;
          if (unsupportedConnectorTypes.includes(integration.type)) continue;
          if (integration.type.includes('VPC')) {
            vpcConnectors.push({
              title: integration.display_name,
              enum: integration.type,
              status: IntegrationStatus.AVAILABLE
            });
            continue;
          }
          const card = cardsData.find(e => e.enum === integration.type);
          const cardData: CardData = {
            title: integration.display_name,
            buttonLink: card?.buttonLink ?? '',
            buttonText: 'Connect',
            desc: card?.desc ?? '',
            imgUrl: card?.url ?? '',
            enum: integration.type,
            docs: card?.docs,
            status: IntegrationStatus.AVAILABLE
          };
          integrations[integration.category] = integrations[integration.category] || []; // Check if the key exists, if not create an empty array
          integrations[integration.category].push(cardData);
          allAvailableConnectors.push(cardData);
        }

        for (let integration of response?.connectors ?? []) {
          if (integration.type === connectors.AGENT_PROXY) agentProxy = integration;
          if (unsupportedConnectorTypes.includes(integration.type)) continue;
          if (integration.type.includes('VPC')) {
            vpcConnectors.push({
              id: integration.id ?? '',
              title: integration.display_name,
              enum: integration.type,
              status: IntegrationStatus.ACTIVE
            });
            continue;
          }
          const card = cardsData.find(e => e.enum === integration.type);
          const cardData: CardData = {
            id: integration.id ?? '',
            title: integration.display_name,
            buttonLink: card?.buttonLink ?? '',
            buttonText: 'View Details',
            desc: card?.desc ?? '',
            imgUrl: card?.url ?? '',
            docs: card?.docs,
            enum: integration.type,
            status: IntegrationStatus.ACTIVE
          };
          integrations[integration.category] = integrations[integration.category] || []; // Check if the key exists, if not create an empty array
          integrations[integration.category].push(cardData);
          allAvailableConnectors.push(cardData);
        }

        integrations['allAvailableConnectors'] = allAvailableConnectors;

        for (let vpcConnector of vpcConnectors) {
          const integration = integrations.allAvailableConnectors.find(
            e => e.enum === vpcConnector.enum.replace('_VPC', '')
          );
          if (integration) {
            integration.vpc = vpcConnector;
          }
        }

        return { integrations, vpcConnectors, agentProxy };
      },
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        try {
          // Wait for the query to complete
          const { data } = await queryFulfilled;
          // Dispatch an action to update the global state
          dispatch(setIntegrations(data.integrations?.allAvailableConnectors));
          dispatch(setVpcConnectors(data.vpcConnectors));
          dispatch(setAgentProxy(data.agentProxy));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      }
    })
  })
});

export const { useLazyGetConnectorListQuery, useGetConnectorListQuery } = getConnectorListApi;
