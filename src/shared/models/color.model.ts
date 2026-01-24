export interface IColor {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly hexCode: string | null;
  readonly order: number | null;
  readonly active: boolean;
}
