import type { ProductPrice, ProductPriceDimensions } from "./product-schema";

import { type Mold } from "../mold/types";
import {
  calculateMaxMachiningCost,
  calculateProductFinalPriceData,
  calculateProductPrice,
} from "./price";

interface PipelineResult {
  minimumArea: number;
  moldPrice: number;
  productPrices: ProductPrice[];
}

/**
 * 获取产品报价的详细信息
 * @param result 流水线结果
 * @returns 格式化的报价信息
 */
export function calculateProductFinalPrice(
  paramsProducts: ProductPriceDimensions[],
  mold: Mold,
): ProductPrice[] {
  if (paramsProducts.length === 0) {
    throw new Error("产品数量不能为0");
  }

  //计算产品的加工费用，找出最大的那个
  const machiningCost = calculateMaxMachiningCost(mold, paramsProducts);

  //用最大的加工成本计算的加工费用
  const initialPrices = calculateProductPrice(paramsProducts, machiningCost);

  return calculateProductFinalPriceData(initialPrices);
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
