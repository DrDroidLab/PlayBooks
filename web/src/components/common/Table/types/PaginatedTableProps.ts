import { Action } from "./Action";
import { Column } from "./Column";

export interface PaginatedTableProps<T> {
  columns: Column<T>[];
  data: T[]; // The data array, each item can have more fields than just those shown in the table
  actions: Action<T>[];
  total: number;
  tableContainerStyles?: object;
  params?: any;
  onSortChange?: (params: any) => void;
}
