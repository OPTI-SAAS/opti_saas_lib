import type { ProductType } from './product.model';

export interface IBrand {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly logo: string | null;
  readonly country: string | null;
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
 * Creates an empty brand with default values.
 * @returns A new empty brand
 */
export function createEmptyBrand(): IBrand {
  return {
    id: '',
    code: '',
    label: '',
    logo: null,
    country: null,
    order: null,
    active: true,
    aliases: [],
    manufacturerCodes: [],
    parentCompany: null,
    website: null,
    productLines: [],
  };
}
