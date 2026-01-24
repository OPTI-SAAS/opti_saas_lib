import type { ProductType } from './product.model';

export interface IManufacturer {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly country: string | null;
  readonly contact: string | null;
  readonly order: number | null;
  readonly active: boolean;

  // Champs pour matching OCR
  readonly aliases: readonly string[];
  readonly manufacturerCodes: readonly string[];
  readonly parentCompany: string | null;
  readonly website: string | null;
  readonly productLines: readonly ProductType[];
}

/**
 * Creates an empty manufacturer with default values.
 * @returns A new empty manufacturer
 */
export function createEmptyManufacturer(): IManufacturer {
  return {
    id: '',
    code: '',
    label: '',
    country: null,
    contact: null,
    order: null,
    active: true,
    aliases: [],
    manufacturerCodes: [],
    parentCompany: null,
    website: null,
    productLines: [],
  };
}
