export interface IProductPhoto {
  url: string | null;
  base64: string | null;
}

/**
 * Code produit spécifique à un fournisseur.
 * Un même produit peut avoir des codes différents chez différents fournisseurs.
 */
export interface ISupplierProductCode {
  readonly supplierId: string;
  readonly code: string;
  readonly lastPurchasePrice: number | null;
  readonly lastPurchaseDate: string | null;
}

export interface IProductStockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

/**
 * Product type - Option C hybrid approach.
 * Frames are unified under 'frame' with a subType for differentiation.
 */
export type ProductType = 'frame' | 'lens' | 'contact_lens' | 'clip_on' | 'accessory';

export type ProductStatus =
  | 'DISPONIBLE'
  | 'RESERVE'
  | 'EN_COMMANDE'
  | 'EN_TRANSIT'
  | 'RUPTURE'
  | 'OBSOLETE';

export type PricingMode = 'coefficient' | 'fixedAmount' | 'fixedPrice';

interface IBaseProduct {
  id: string;
  internalCode: string;
  barcode: string | null;
  productType: ProductType;
  designation: string;
  brandId: string | null;
  modelId: string | null;
  color: string | null;
  familyId: string | null;
  alertThreshold: number;

  // Codes produits pour matching OCR
  externalReference: string | null;
  supplierCodes: readonly ISupplierProductCode[];

  // Pricing - Mode de calcul prix de vente
  pricingMode: PricingMode;
  coefficient: number | null;
  fixedAmount: number | null;
  fixedPrice: number | null;
  tvaRate: number;

  // Champs calculés (readonly après création)
  purchasePriceExclTax: number;
  totalQuantity: number;
  stockByWarehouse: IProductStockByWarehouse[];
  status: ProductStatus;

  photo: IProductPhoto | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface IFrame extends IBaseProduct {
  productType: 'frame';
  gender: string | null;
  shape: string | null;
  material: string | null;
  mountingType: string | null;
  hingeType: string | null;
  caliber: number | null;
  bridge: number | null;
  branch: number | null;
}

export interface ILens extends IBaseProduct {
  productType: 'lens';
  lensType: string;
  material: string;
  refractiveIndex: number | null;
  tint: string | null;
  treatments: string[];
  manufacturer: string | null;
}

export interface IContactLens extends IBaseProduct {
  productType: 'contact_lens';
  contactLensType: string;
  usage: string;
  manufacturer: string | null;
  baseCurve: number;
  diameter: number;
  unitQuantity: number;
}

export interface IAccessory extends IBaseProduct {
  productType: 'accessory';
}

export interface IClipOn extends IBaseProduct {
  productType: 'clip_on';
  clipType: string | null;
  treatments: string[];
  tint: string | null;
  compatibleCaliber: string | null;
}

export type Product = IFrame | ILens | IContactLens | IAccessory | IClipOn;
