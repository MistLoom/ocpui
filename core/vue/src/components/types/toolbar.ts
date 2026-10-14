export interface ToolbarAction {
  key: string;
  label: string;
  icon?: any;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  disabled?: boolean;
  handler?: (items: any[]) => void;
}
