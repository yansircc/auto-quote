import type { Product } from "./types";
import type {
  MoldDimensions,
  ProductPrice,
  ProductPriceDimensions,
} from "./product-schema";

import { type Mold } from "../mold/types";
import { calculateMinArea } from "../mold/layout";
import { getMoldMaterial, type MoldMaterial } from "../materials";
import {
  calculateGrossProfit,
  calculateMaintenanceFee,
  calculateMoldMaterialCost,
  calculateProcessingFee,
} from "../mold/cost";
import { getHeightByMaxProductHeight, getMarginByWidth } from "../mold/common";
import { calculateProductPrice } from "./price";

interface PipelineResult {
  minimumArea: number;
  moldPrice: number;
  productPrices: ProductPrice[];
}

/**
 * 运行产品报价流水线
 * @param products 产品信息
 * @param moldConfig 模具配置
 * @param maxMachiningCost 最大加工成本
 * @returns 包含最小面积、模具价格和产品价格的结果
 */
export function runProductPricePipeline(
  products: Product[],
  moldMaterial: MoldMaterial,
): MoldDimensions {
  if (!products || products.length === 0) {
    throw new Error("产品列表不能为空");
  }

  console.log("layoutResult before calculateMinArea");

  // 1. 计算最小面积
  // const layoutResult = calculateMinArea(
  //   products.map((product) => ({
  //     width: product.dimensions.width,
  //     height: product.dimensions.height,
  //   })),
  // );

  const layoutResult = {
    width: 200,
    height: 200,
    layout: [],
  };

  console.log("layoutResult after calculateMinArea", layoutResult);

  //计算模具高度

  const maxProductHeight = getHeightByMaxProductHeight(
    Math.max(...products.map((product) => product.dimensions.height)),
  );

  //计算模具边距
  const moldMargin = Math.max(
    getMarginByWidth(layoutResult.width),
    getMarginByWidth(layoutResult.height),
  );

  //计算模具重量
  const moldWeight =
    (getMoldMaterial(moldMaterial.name)?.density ?? 0) *
    layoutResult.width *
    layoutResult.height *
    maxProductHeight;

  //2。构建模具
  //2。构建模具
  const mold: Mold = {
    material: {
      id: moldMaterial.id,
      name: moldMaterial.name,
      density: moldMaterial.density,
      pricePerKg: moldMaterial.pricePerKg,
    },
    dimensions: {
      width: layoutResult.width + moldMargin * 2,
      height: maxProductHeight,
      depth: layoutResult.height + moldMargin * 2,
    },
    weight: moldWeight,
    cavityCount: products.length,
  };

  // 2. 计算模具材料成本
  const moldMaterialCost = calculateMoldMaterialCost(mold);

  // 计算供应商运维费
  const maintenanceFee = calculateMaintenanceFee(mold.weight, null);

  //计算模具额外加工费
  const processingFee = calculateProcessingFee(mold, null);

  //计算模具毛利
  const moldProfit = calculateGrossProfit(mold.weight, null);

  //计算模具价格
  const moldPrice =
    moldMaterialCost + maintenanceFee + processingFee + moldProfit;

  // // 3. 转换为价格计算所的维度
  // const priceDimensions: ProductPriceDimensions[] = products.map((product) => ({
  //   productMaterial: product.material.name,
  //   volume: product.netVolume,
  //   productQuantity: product.quantity,
  //   length: product.dimensions.length,
  //   width: product.dimensions.width,
  //   height: product.dimensions.height,
  //   color: product.color,
  //   density: product.material.density,
  // }));

  // // 4. 计算产品价格
  // const initialPrices = calculateProductPrice(
  //   priceDimensions,
  //   maxMachiningCost,
  // );

  // // 5. 计算最终价格
  // const productPrices = calculateProductFinalPrice(initialPrices);

  return {
    width: mold.dimensions.width,
    depth: mold.dimensions.height,
    height: mold.dimensions.depth,
    moldMaterial: mold.material.name,
    moldWeight: Number(mold.weight.toFixed(3)),
    moldPrice: Number(moldPrice.toFixed(3)),
    maxInnerLength: 0,
    maxInnerWidth: 0,
    verticalMargin: moldMargin,
    horizontalMargin: moldMargin,
  };
}

/**
 * 获取产品报价的详细信息
 * @param result 流水线结果
 * @returns 格式化的报价信息
 */
export function calculateProductFinalPrice(
  paramsProducts: ProductPriceDimensions[],
): ProductPrice[] {
  const maxMachiningCost = 0;
  const initialPrices = calculateProductPrice(paramsProducts, maxMachiningCost);

  return calculateProductFinalPrice(initialPrices);
}

/**
 * 获取产品报价的详细信息
 * @param result 流水线结果
 * @returns 格式化的报价信息
 */
export function getPriceDetails(result: PipelineResult): string {
  const { minimumArea, moldPrice, productPrices } = result;

  const totalProductPrice = productPrices.reduce(
    (sum, product) => sum + (product.finalPrice || 0),
    0,
  );

  return `
模具信息:
- 最小面积: ${minimumArea.toFixed(2)} mm²
- 模具价格: ${moldPrice.toFixed(2)} 元

产品信息:
${productPrices
  .map(
    (product, index) => `
产品 ${index + 1}:
- 材料: ${product.productMaterial}
- 数量: ${product.productQuantity}
- 单价: ${(product.finalPrice / (product.productQuantity || 1)).toFixed(2)} 元
- 总价: ${product.finalPrice.toFixed(2)} 元
`,
  )
  .join("\n")}

总价格: ${(moldPrice + totalProductPrice).toFixed(2)} 元
`;
}
