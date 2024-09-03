export interface Action<T> {
  icon: React.ReactNode;
  label: string;
  action: (item: T) => void;
  tooltip?: string;
}
