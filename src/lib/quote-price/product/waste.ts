import { fixedLossRate } from "src/lib/constants/price-constant";

/**
 * 计算材料损耗费用
 * @param {number} productMaterialCost 总产品材料成本
 * @returns {number} 损耗费用
 */
export function calculateWasteCost(productMaterialCost: number): number {
  // TODO:
  // 1. 总损耗费用 = 总产品材料成本 × 损耗系数
  // 2. 损耗系数 = 1 - 损耗率
  if (!productMaterialCost) {
    throw new Error("产品材料成本不能为空");
  }
  if (fixedLossRate <= 0) {
    throw new Error("损耗率不能为负数或0");
  }
  if (productMaterialCost <= 0) {
    throw new Error("产品材料成本不能为负数或0");
  }

  const fixedLoss = productMaterialCost * (fixedLossRate - 1);
  //保留三位小数
  return Number(fixedLoss.toFixed(3));
}
