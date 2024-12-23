/**
 * path: src\lib\quote-price\mold\cost.ts
 * 这个函数用来计算模具的成本，模具成本 = 模具体积(变量) * 材料密度(常数) * 材料单位价格(常数)
 *
 * @param  {Mold} mold 模具信息
 * @param  {MoldConfig} config 模具配置
 * @return {number} 成本，单位为RMB
 */

import { defaultMoldMaterialDensity, maxCalculatedWeight, minCalculatedWeight, minSalesWeight, moldMaterialCostStepOne, moldMaterialCostStepTwo, moldMaterialPerPrice, moldPriceDifferList, operatingExpenseList } from "src/lib/constants/price-constant";
import type { Mold, MoldConfig } from "./types";
import { getMoldPriceDifferByMaterial, getOperatingExpenseByWeight } from "./common";

/**
 * 计算模具材料成本
 * @param {Mold} mold 模具信息
 * @returns {number} 材料成本
 */
export function calculateMoldMaterialCost(mold: Mold): number {
  // TODO:
  // 1. 计算模具体积 = 宽度 × 高度 × 深度
  // 2. 材料成本 = 体积 × 材料密度 × 材料单价
  if (mold.dimensions.width <= 0 || mold.dimensions.height <= 0 || mold.dimensions.depth <= 0) {
    throw new Error('模具尺寸不能为负数或0');
  }
  const moldVolume = mold.dimensions.width * mold.dimensions.height * mold.dimensions.depth;
  const materialWeight = moldVolume * defaultMoldMaterialDensity;
  const materialCost = Math.max(materialWeight, minSalesWeight) * moldMaterialPerPrice;
  return materialCost;
}

/**
 * 计算供应商运维费
 * @param {number} materialCost 材料成本
 * @param {MoldConfig} config 模具配置
 * @returns {number} 运维费用
 */
export function calculateMaintenanceFee(
  moldWeight: number,
  config: MoldConfig,
): number {
  // TODO:
  // 1. 判断材料成本是否超过阈值
  // 2. 根据不同阈值使用对应费率计算
  if (moldWeight <= 0) {
    throw new Error('模具重量不能为负数或0');
  }
  if (moldWeight <= minCalculatedWeight) {
    return Math.max(moldWeight, minSalesWeight) * moldMaterialPerPrice * moldMaterialCostStepOne;
  }
  else if (moldWeight > maxCalculatedWeight) {
    throw new Error('模具重量超过阈值');
  }
  else {
    return moldWeight * moldMaterialPerPrice * moldMaterialCostStepTwo;
  }
}

/**
 * 计算毛利
 * @param {number} weight 模具重量
 * @param {MoldConfig} config 模具配置
 * @returns {number} 毛利
 */
export function calculateGrossProfit(
  moldWeight: number,
  config: MoldConfig,
): number {
  // TODO:
  // 1. 根据重量找到对应的阈值区间
  // 2. 使用对应的费率计算毛利
  if (moldWeight <= 0) {
    throw new Error('模具重量不能为负数或0');
  }
  const runningFee = getOperatingExpenseByWeight(moldWeight);
  return runningFee;
}

/**
 * 计算额外加工费
 * @param {Mold} mold 模具信息
 * @param {MoldConfig} config 模具配置
 * @returns {number} 加工费用
 */
export function calculateProcessingFee(mold: Mold, config: MoldConfig): number {
  // TODO:
  // 1. 根据模具材料找到对应的加工费用
  if (mold.weight <= 0) {
    throw new Error('模具重量不能为负数或0');
  }

  let differPrice = 0;
  const differPriceCoefficient = getMoldPriceDifferByMaterial(mold.material.name);
  differPrice = mold.weight * differPriceCoefficient;

  return differPrice;
}

/**
 * 计算模具总成本
 * @param {number} materialCost 模具材料成本
 * @param {number} maintenanceFee 供应商运维费
 * @param {number} grossProfit 毛利
 * @param {number} processingFee 额外加工费
 * @returns {number} 总成本
 */
export function calculateTotalMoldCost(
  materialCost: number,
  maintenanceFee: number,
  grossProfit: number,
  processingFee: number,
): number {
  // TODO:
  // 1. 计算材料成本
  // 2. 计算供应商运维费
  // 3. 计算毛利
  // 4. 计算额外加工费
  // 5. 求和得到总成本
  if (materialCost <= 0 || maintenanceFee <= 0 || processingFee <= 0) {
    throw new Error('成本不能为负数或0');
  }
  return materialCost + maintenanceFee + processingFee;
}

/**
 * 计算模具加工费用
 * @param {number} materialProcessingFee 材料加工费
 * @param {number} structureProcessingFee 结构加工费
 * @param {number} surfaceTreatmentFee 表面处理费
 * @returns {number} 总加工费用
 */
export function calculateMoldProcessingFee(
  materialProcessingFee: number,
  structureProcessingFee: number,
  surfaceTreatmentFee: number,
): number {
  // 伪代码：总加工费用 = 材料加工费 + 结构加工费 + 表面处理费
  return materialProcessingFee + structureProcessingFee + surfaceTreatmentFee;
}

/**
 * 计算模具售价
 * @param {number} materialCost 模具材料成本
 * @param {number} maintenanceFee 供应商运维费
 * @param {number} grossProfit 毛利
 * @param {number} processingFee 额外加工费
 * @returns {number} 售价
 */
export function calculateMoldPrice(
  materialCost: number,
  maintenanceFee: number,
  processingFee: number,
  grossProfit: number,
): number {
  if (materialCost <= 0 || maintenanceFee <= 0 || processingFee <= 0) {
    throw new Error('成本不能为负数或0');
  }
  if (grossProfit < 0) {
    throw new Error('毛利不能为负数');
  }
  return materialCost + maintenanceFee + processingFee + grossProfit;
}



