
export const civilitiesValues = ["mrs", "Mr", "Autre"] as const;
export type Civilities = typeof civilitiesValues[number];