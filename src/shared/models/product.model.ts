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
export type ProductType = 'frame' | 'lens' | 'contact_lens' | 'clipon' | 'accessory';

export type ProductStatus =
  | 'DISPONIBLE'
  | 'RESERVE'
  | 'EN_COMMANDE'
  | 'EN_TRANSIT'
  | 'RUPTURE'
  | 'OBSOLETE';

export type PricingMode = 'coefficient' | 'fixed-added-amount' | 'fixed-price';

interface IBaseProduct {
  id: string;
  internalCode: string;
  barcode: string | null;
  productType: ProductType;
  designation: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  family: string[];
  minimumStockAlert: number;

  // Codes produits pour matching OCR
  externalReference: string | null;
  supplierCodes: readonly ISupplierProductCode[];

  // Pricing - Mode de calcul prix de vente
  pricingMode: PricingMode;
  coefficient: number | null;
  fixedAddedAmount: number | null;
  fixedPrice: number | null;
  vatId: string | null;

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
  frameGender: string | null;
  frameShape: string | null;
  frameMaterial: string | null;
  frameType: string | null;
  frameHingeType: string | null;
  frameEyeSize: number | null;
  frameBridge: number | null;
  frameTemple: number | null;
  frameFinish: string | null;
}

export interface ILens extends IBaseProduct {
  productType: 'lens';
  lensType: string;
  lensMaterial: string;
  lensRefractiveIndex: number | null;
  lensTint: string | null;
  lensTreatments: string[];
  lensFabricant: string | null;
}

export interface IContactLens extends IBaseProduct {
  productType: 'contact_lens';
  contactLensType: string;
  contactLensUsage: string;
  contactLensFabricant: string | null;
  contactLensBaseCurve: number;
  contactLensDiameter: number;
  contactLensQuantityPerBox: number;
}

export interface IAccessory extends IBaseProduct {
  productType: 'accessory';
}

export interface IClipOn extends IBaseProduct {
  productType: 'clipon';
  clipOnClipType: string | null;
  clipOnTreatments: string[];
  clipOnTint: string | null;
  clipOnCompatibleCaliber: string | null;
}

export type Product = IFrame | ILens | IContactLens | IAccessory | IClipOn;
