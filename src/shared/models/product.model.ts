export interface IProductPhoto {
  url: string | null;
  base64: string | null;
}

export interface IProductSupplier {
  id: string;
  name: string;
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

/**
 * Frame sub-type for differentiating frame categories.
 */
export type FrameSubType = 'optical' | 'sun' | 'safety' | 'sport' | 'reading';

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
  supplierIds: string[];
  suppliers: IProductSupplier[];
  familyId: string | null;
  subFamilyId: string | null;
  alertThreshold: number;

  // Codes produits pour matching OCR
  manufacturerRef: string | null;
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
  frameSubType: FrameSubType;
  gender: string | null;
  shape: string | null;
  material: string | null;
  frameType: string | null;
  hingeType: string | null;
  eyeSize: number | null;
  bridge: number | null;
  temple: number | null;
  frameColor: string | null;
  templeColor: string | null;
  frameFinish: string | null;
  frontPhoto: IProductPhoto | null;
  sidePhoto: IProductPhoto | null;
  // Safety-specific fields (only for frameSubType === 'safety')
  safetyStandard: string | null;
  safetyRating: string | null;
  protectionType: string | null;
  lensIncluded: boolean;
  prescriptionCapable: boolean;
}

export interface ILens extends IBaseProduct {
  productType: 'lens';
  lensType: string;
  material: string;
  refractiveIndex: string | null;
  tint: string | null;
  filters: string[];
  treatments: string[];
  spherePower: number | null;
  cylinderPower: number | null;
  axis: number | null;
  addition: number | null;
  diameter: number | null;
  baseCurve: number | null;
  curvature: number | null;
  manufacturerId: string | null;
  opticalFamily: string | null;
}

export interface IContactLens extends IBaseProduct {
  productType: 'contact_lens';
  contactLensType: string;
  usage: string;
  laboratoryId: string | null;
  commercialModel: string | null;
  spherePower: number | null;
  cylinder: number | null;
  axis: number | null;
  addition: number | null;
  baseCurve: number;
  diameter: number;
  quantityPerBox: number;
  pricePerBox: number;
  pricePerUnit: number;
  batchNumber: string | null;
  expirationDate: Date | null;
  boxQuantity: number | null;
  unitQuantity: number | null;
}

export interface IAccessory extends IBaseProduct {
  productType: 'accessory';
  category: string;
  subCategory: string | null;
}

export interface IClipOn extends IBaseProduct {
  productType: 'clip_on';
  clipType: string | null;
  polarized: boolean;
  mirrorCoating: boolean;
  tint: string | null;
  compatibleFrameSize: string | null;
}

export type Product = IFrame | ILens | IContactLens | IAccessory | IClipOn;
