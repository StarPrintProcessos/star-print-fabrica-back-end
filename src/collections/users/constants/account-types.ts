export const ACCOUNT_TYPES = ['admin', 'manager', 'operator', 'automation'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];