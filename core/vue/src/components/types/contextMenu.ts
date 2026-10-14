export interface ContextMenuItem {
  key?: string;
  label: string;
  icon?: any;
  shortcut?: string;
  disabled?: boolean;
  divided?: boolean;
  danger?: boolean;
  checked?: boolean;
  children?: ContextMenuItem[];
  handler?: () => void;
}
