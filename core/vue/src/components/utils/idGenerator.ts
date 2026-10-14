let idCounter = 0;

export const genId = (prefix = 'id'): string => {
  return `${prefix}-${++idCounter}`;
};

export const genUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
};
