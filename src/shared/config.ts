import { OptionsOfArray } from './types';

// Definition of the configuration of authorizations and resources and specialities
const _authorisations = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'GENERATE'
] as const;

const _resources = [
  'USERS',
  'CLIENTS',
  'CLIENTS_FILES',
  'SUPPLIERS',
  'PRODUCTS',
  'INVOICES',
  'REGULATIONS',
  'CASH_REGISTER',
  'EXPORTS',
] as const;

export type Authorisation = OptionsOfArray<typeof _authorisations>;
export type Resource = OptionsOfArray<typeof _resources>;

// the mapping of authorizations and resources and specialities

export const RESOURCE_AUTHORISATION_MAP = {
  USERS: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  CLIENTS: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  CLIENTS_FILES: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  SUPPLIERS: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  PRODUCTS: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  INVOICES: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  REGULATIONS: ['UPDATE', 'DELETE'],
  CASH_REGISTER: ['CREATE', 'READ', 'UPDATE'],
  EXPORTS: ['GENERATE'],
} as const satisfies Record<Resource, Authorisation[]>;
