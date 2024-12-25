import { productProfitRate } from "src/lib/constants/price-constant";

/**
 * 获取产品的利润参数
 * @returns {number} 利润参数
 */
export function getProductProfitRate(): number {
  // const profitCoefficient = moldConstantSettingList.find(rule => rule.constantName === "profitCoefficient")?.constantValue ?? 1.5;
  return productProfitRate;
}
