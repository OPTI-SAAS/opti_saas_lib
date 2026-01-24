import type { ProductType } from './product.model';

export interface ILaboratory {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly country: string | null;
  readonly order: number | null;
  readonly active: boolean;

  // Champs pour matching OCR
  readonly aliases: readonly string[];
  readonly parentCompany: string | null;
  readonly website: string | null;
  readonly productLines: readonly ProductType[];
}

/**
 * Creates an empty laboratory with default values.
 * @returns A new empty laboratory
 */
export function createEmptyLaboratory(): ILaboratory {
  return {
    id: '',
    code: '',
    label: '',
    country: null,
    order: null,
    active: true,
    aliases: [],
    parentCompany: null,
    website: null,
    productLines: [],
  };
}
