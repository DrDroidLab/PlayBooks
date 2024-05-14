import { ExternalLink, PlaybookTask } from "../index.ts";

export interface PlaybookContractStep {
  name: string;
  description: string;
  external_links: ExternalLink[];
  tasks: PlaybookTask[];
}
