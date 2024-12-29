import type { ProductPrice, ProductPriceDimensions } from "./product-schema";

import { type Mold } from "../mold/types";
import { calculateProductFinalPriceData, calculateProductPrice } from "./price";
import { determineMachineTonnage } from "../machine/tonnage";
import { calculateInjectionVolume } from "./volume";

import { calculateProductionProcessingFee } from "./cost";

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
  //计算模具的注胶量
  const injectionVolume = paramsProducts.reduce((sum, product) => {
    return sum + product.volume * product.density;
  }, 0);

  console.log("mold:", mold);
  console.log("injectionVolume:", injectionVolume);

  const safetyFactorVolume = calculateInjectionVolume(injectionVolume);
  //根据模具的尺寸和注胶量确定机器吨位
  const machineTonnage = determineMachineTonnage(
    mold.dimensions.width,
    mold.dimensions.height,
    mold.dimensions.depth,
    safetyFactorVolume,
  );

  //计算产品的加工费用，找出最大的那个
  const machiningCost = Math.max(
    ...paramsProducts.map((product) => {
      return calculateProductionProcessingFee(
        machineTonnage,
        product.productQuantity,
        undefined,
      );
    }),
  );

  //用最大的加工成本计算的加工费用
  const initialPrices = calculateProductPrice(paramsProducts, machiningCost);
  // return [];
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
