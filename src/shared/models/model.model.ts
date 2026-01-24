export interface IModel {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly brandId: string | null;
  readonly order: number | null;
  readonly active: boolean;

  // Champs pour matching OCR
  readonly aliases: readonly string[];
  readonly manufacturerCode: string | null;
  readonly category: string | null;
  readonly collection: string | null;
  readonly discontinued: boolean;
}

/**
 * Creates an empty model with default values.
 * @returns A new empty model
 */
export function createEmptyModel(): IModel {
  return {
    id: '',
    code: '',
    label: '',
    brandId: null,
    order: null,
    active: true,
    aliases: [],
    manufacturerCode: null,
    category: null,
    collection: null,
    discontinued: false,
  };
}
