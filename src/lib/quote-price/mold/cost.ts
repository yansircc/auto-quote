/**
 * path: src\lib\quote-price\mold\cost.ts
 * 这个函数用来计算模具的成本，模具成本 = 模具体积(变量) * 材料密度(常数) * 材料单位价格(常数)
 *
 * @param  {Mold} mold 模具信息
 * @param  {MoldConfig} config 模具配置
 * @return {number} 成本，单位为RMB
 */

import type { Mold, MoldConfig } from "./types";

/**
 * 计算模具材料成本
 * @param {Mold} mold 模具信息
 * @returns {number} 材料成本
 */
export function calculateMoldMaterialCost(mold: Mold): number {
  // TODO:
  // 1. 计算模具体积 = 宽度 × 高度 × 深度
  // 2. 材料成本 = 体积 × 材料密度 × 材料单价
  return 0;
}

/**
 * 计算供应商运维费
 * @param {number} materialCost 材料成本
 * @param {MoldConfig} config 模具配置
 * @returns {number} 运维费用
 */
export function calculateMaintenanceFee(
  materialCost: number,
  config: MoldConfig,
): number {
  // TODO:
  // 1. 判断材料成本是否超过阈值
  // 2. 根据不同阈值使用对应费率计算
  return 0;
}

/**
 * 计算毛利
 * @param {number} weight 模具重量
 * @param {MoldConfig} config 模具配置
 * @returns {number} 毛利
 */
export function calculateGrossProfit(
  weight: number,
  config: MoldConfig,
): number {
  // TODO:
  // 1. 根据重量找到对应的阈值区间
  // 2. 使用对应的费率计算毛利
  return 0;
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
  return 0;
}

/**
 * 计算模具总成本
 * @param {Mold} mold 模具信息
 * @param {MoldConfig} config 模具配置
 * @returns {number} 总成本
 */
export function calculateTotalMoldCost(mold: Mold, config: MoldConfig): number {
  // TODO:
  // 1. 计算材料成本
  // 2. 计算供应商运维费
  // 3. 计算毛利
  // 4. 计算额外加工费
  // 5. 求和得到总成本
  return 0;
}

/**
 * 计算模具额外加工费
 * @param {Mold} mold 模具信息
 * @param {MoldConfig} config 模具配置
 * @returns {number} 额外加工费总和
 */
export function calculateExtraProcessingFee(
  mold: Mold,
  config: MoldConfig,
): number {
  // TODO:
  // 1. 计算额外加工费
  // 2. 求和得到总额外加工费
  return 0;
}
