/**
 * 根据模具成本和加工费计算模具利润
 * 利润 = (模具成本 + 额外加工费) * 利润系数
 *
 * @param {number} moldCost 模具成本
 * @param {number} extraProcessingFee 额外加工费
 * @param {number} moldProfitRate 利润系数
 * @returns {number} 模具利润
 */
export function calculateMoldProfit(
  moldCost: number,
  extraProcessingFee: number,
  moldProfitRate: number,
): number {
  // 伪代码
  return 0;
}

/**
 * 模具最终售价 = (模具成本 + 额外加工费) * (1 + 利润系数)
 *
 * @param {number} moldCost 模具成本
 * @param {number} extraProcessingFee 额外加工费
 * @param {number} moldProfitRate 利润系数
 * @returns {number} 模具售价
 */
export function calculateMoldSellingPrice(
  moldCost: number,
  extraProcessingFee: number,
  moldProfitRate: number,
): number {
  // 伪代码
  return 0;
}
