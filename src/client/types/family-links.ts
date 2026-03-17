export const familyLinkValues = [
  'principal',
  'conjoint',
  'tutor',
  'parent',
  'children',
] as const;

export type FamilyLink = (typeof familyLinkValues)[number];
