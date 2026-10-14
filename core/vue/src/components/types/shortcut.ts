export interface ShortcutConfig {
  id: string;
  key: string;
  description: string;
  category?: string;
  defaultKey: string;
  disabled?: boolean;
}

export interface ShortcutGroup {
  name: string;
  items: ShortcutConfig[];
}
