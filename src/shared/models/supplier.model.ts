import { createEmptyAddress, type IAddress } from './address.model';

export interface ISupplier {
  readonly id: string | null;
  readonly code: string;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: IAddress;
  readonly contactName: string | null;
  readonly website: string | null;
  readonly ice: string | null;
  readonly tradeRegister: string | null;
  readonly taxId: string | null;
  readonly businessLicense: string | null;
  readonly siret: string | null;
  readonly bank: string | null;
  readonly bankAccountNumber: string | null;
  readonly active: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;
}

export interface ISupplierSearchRequest {
  query: string | null;
  active: boolean | null;
}

export type SupplierCreateRequest = Omit<ISupplier, 'id' | 'createdAt' | 'updatedAt'>;
export type SupplierUpdateRequest = Partial<SupplierCreateRequest>;

/**
 * Creates an empty supplier for new supplier creation.
 * @returns A new empty supplier with id: null
 */
export function createEmptySupplier(): ISupplier {
  return {
    id: null,
    code: '',
    name: '',
    email: null,
    phone: null,
    address: { ...createEmptyAddress(), country: 'Maroc' },
    contactName: null,
    website: null,
    ice: null,
    tradeRegister: null,
    taxId: null,
    businessLicense: null,
    siret: null,
    bank: null,
    bankAccountNumber: null,
    active: true,
    createdAt: null,
    updatedAt: null,
  };
}
