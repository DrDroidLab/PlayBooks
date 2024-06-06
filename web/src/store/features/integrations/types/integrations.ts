import { CardData } from "./index.ts";

export type IntegrationType = {
  [title: string]: CardData[];
};

export type Integrations = {
  integrations: IntegrationType;
  vpcConnectors: {
    [title: string]: CardData[];
  };
  agentProxy: any;
  connectedConnectors: CardData[];
};
