export const clientTypeValues = ['particulier', 'professionnel'] as const;

export type ClientType = (typeof clientTypeValues)[number];
