export interface Column<T> {
  header: string;
  key: keyof T;
  isMain?: boolean; // Indicates if this column should take up maximum space
}
