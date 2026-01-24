export interface IFamily {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly order: number | null;
  readonly active: boolean;
}

export interface ISubFamily {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly familyId: string | null;
  readonly order: number | null;
  readonly active: boolean;
}
