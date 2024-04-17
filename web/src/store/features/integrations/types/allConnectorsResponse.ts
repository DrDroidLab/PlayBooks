export type AllConnectorsResponse = {
  sucess: boolean;
  request_connectors: [
    {
      type: string;
      display_name: string;
      category: string;
    }
  ];
  available_connectors: [
    {
      type: string;
      display_name: string;
      category: string;
    }
  ];
  connectors: [
    {
      id: string;
      type: string;
      name: string;
      category: string;
      is_active: boolean;
      display_name: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
    }
  ];
};
