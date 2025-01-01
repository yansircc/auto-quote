import { z } from "zod";

export const productPriceDimensionsSchema = z.object({
  depth: z.number(),
  width: z.number(),
  height: z.number(),
  volume: z.number(),
  productMaterial: z.string(),
  productQuantity: z.number(),
  color: z.string(),
  density: z.number(),
});

export type ProductPriceDimensions = z.infer<
  typeof productPriceDimensionsSchema
>;

export const moldDimensionsSchema = z.object({
  depth: z.number(),
  width: z.number(),
  height: z.number(),
  moldMaterial: z.string().default(""),
  moldWeight: z.number().optional().default(0),
  moldPrice: z.number().optional().default(0),
  maxInnerLength: z.number().optional().default(0),
  maxInnerWidth: z.number().optional().default(0),
  verticalMargin: z.number().optional().default(0),
  horizontalMargin: z.number().optional().default(0),
  scores: z.record(z.string(), z.number()).optional(),
  weightedAverage: z.number().optional(),
});

export type MoldDimensions = z.infer<typeof moldDimensionsSchema>;

export const processingCostSchema = z.object({
  productMakingQuantity: z.number(),
  productMakingPrice: z.number(),
  productSinglePrice: z.number(),
  productTotalPrice: z.number(),
});

export const productPriceSchema = z.object({
  depth: z.number(),
  width: z.number(),
  height: z.number(),
  volume: z.number(),
  productMaterial: z.string(),
  productQuantity: z.number(),
  materialPrice: z.number(),
  weight: z.number(),
  remainingQuantity: z.number(),
  processingCost: z.array(processingCostSchema),
  finalPrice: z.number(),
  color: z.string(),
  density: z.number(),
});
export type ProductPrice = z.infer<typeof productPriceSchema>;

export const groupedProductPriceSchema = z.array(productPriceSchema);
export type ProductPriceGroup = z.infer<typeof groupedProductPriceSchema>;

export const Dimensions3DSchema = z.object({
  width: z.number(),
  length: z.number(),
  height: z.number(),
});
