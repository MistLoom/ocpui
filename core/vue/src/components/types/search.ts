export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: any;
  category: string;
  url?: string;
  data?: any;
}

export interface SearchCategory {
  key: string;
  label: string;
  count: number;
}
