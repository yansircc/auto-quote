import type { BaseProduct, Dimensions } from "./base";

export interface SimplifiedProductProps extends BaseProduct {
  shots: number;
  color: string;
}

export interface DetailedProductProps extends SimplifiedProductProps {
  materialName: string;
  quantity: number;
  weight: number;
  cavityIndex: number;
}

export interface ProductPropsForPipeline extends DetailedProductProps {
  dimensions: Dimensions;
  netVolume: number;
}

export interface ForceOptions {
  isForceColorSimultaneous: boolean;
  isForceMaterialSimultaneous: boolean;
}
