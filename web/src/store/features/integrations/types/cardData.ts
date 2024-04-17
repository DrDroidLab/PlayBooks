import { IntegrationStatus } from './index.ts';

export type CardData = {
  id?: string;
  imgUrl: string;
  title: string;
  enum: string;
  desc: string;
  buttonLink: string;
  buttonText: string;
  status: IntegrationStatus;
  vpc?: any;
  docs?: string;
};
