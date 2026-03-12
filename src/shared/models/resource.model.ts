/**
 * Base interface for simple fixed resources.
 * Used for reference data that rarely changes (dropdowns, filters, etc.).
 */
export interface IResource {
  id: string;
  code: string;
  label: string;
  order: number | null;
}

/**
 * All available resource types for the generic resource service.
 */
export const RESOURCE_TYPES = [
  'productTypes',
  'productStatuses',
  'frameCategories',
  'genders',
  'frameShapes',
  'frameMaterials',
  'mountingTypes',
  'hingeTypes',
  'lensTypes',
  'lensMaterials',
  'lensTints',
  'lensTreatments',
  'lensIndices',
  'lensManufacturers',
  'contactLensTypes',
  'contactLensUsages',
  'contactLensManufacturers',
  'clipOnTypes',
  'clipOnTreatments',
  'civilites',
  'pricingModes',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

/**
 * Map of all resources by type.
 */
export type ResourceMap = Record<ResourceType, IResource[]>;
