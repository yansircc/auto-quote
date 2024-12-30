import {
  getPurchaseCostMultiple,
  getMoldGrossProfit,
  getExtraProcessFee,
} from "../core";
import type { MoldMaterial, Dimensions } from "../core";

/**
 * 计算模具的最终价格
 * @param {Dimensions} dimensions 模具尺寸
 * @param {MoldMaterial} material 模具材料
 * @returns {number} 模具的最终价格
 */
export function getMoldTotalPrice(
  dimensions: Dimensions,
  material: MoldMaterial,
): number {
  // 计算体积
  const volume = dimensions.width * dimensions.depth * dimensions.height;

  // 计算重量
  const weight = volume * material.density;

  // 计算材料价格
  const materialCost = weight * material.pricePerKg;

  // 参考价，通常是材料价格，以后可能有变动
  const referencePrice = materialCost;

  // 2. 计算采购成本
  const purchaseCost =
    weight * getPurchaseCostMultiple(weight) * referencePrice;

  // 3. 计算毛利
  const grossProfit = getMoldGrossProfit(weight);

  // 4. 计算额外加工费
  const processingFee = getExtraProcessFee(material.name);

  // 5. 计算最终价格
  return materialCost + purchaseCost + processingFee + grossProfit;
}
