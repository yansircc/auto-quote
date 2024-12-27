import type { ProcessingFeeConfig } from "./types";
import type { Product } from "./types";
import type { RiskAssessment } from "../risk/types";
import { getMachineByTonnage } from "../machine/common";
import { getProductProfitRate } from "./common";

/**
 * 计算单件产品的材料成本
 * @param {Product} product 产品
 * @returns {number} 单件产品材料成本
 */
export function calculateProductMaterialCost(product: Product): number {
  // TODO:
  // 1. 单件产品成本 = 产品净体积 × 产品材料密度 × 产品材料单价
  if (
    !product.netVolume ||
    !product.material.density ||
    !product.material.price
  ) {
    throw new Error("产品净体积、材料密度或材料单价不能为空");
  }
  const producuctWeight = product.netVolume * product.material.density;
  const productMaterialUnitPrice = product.material.price;
  return producuctWeight * productMaterialUnitPrice;
}

/**
 * 计算总产品材料成本
 * @param {Product[]} products 产品列表
 * @returns {number} 总产品材料成本
 */
export function calculateTotalMaterialCost(products: Product[]): number {
  // TODO:
  // 1. 计算每个产品的材料成本
  // 2. 总产品材料成本 = ∑(Q_i × 单件产品成本_i)
  return products.reduce((total, product) => {
    const productMaterialCost = calculateProductMaterialCost(product);
    return total + productMaterialCost * product.quantity;
  }, 0);
}

/**
 * 计算材料损耗费用
 * @param {number} totalMaterialCost 总产品材料成本
 * @param {number} wastageRate 损耗系数
 * @returns {number} 总损耗费用
 */
export function calculateMaterialWastage(
  totalMaterialCost: number,
  wastageRate: number,
): number {
  // TODO:
  // 1. 总损耗费用 = 总产品材料成本 × 损耗系数
  if (!totalMaterialCost || !wastageRate) {
    throw new Error("总产品材料成本或损耗系数不能为空");
  }
  if (wastageRate < 0 || wastageRate > 1) {
    throw new Error("损耗系数必须在0到1之间");
  }
  if (totalMaterialCost <= 0) {
    throw new Error("总产品材料成本不能为负或0");
  }
  return totalMaterialCost * wastageRate;
}

/**
 * 计算加工费用
 * @param {number} tonnage 机器吨位
 * @param {number} shots 模次
 * @param {number} minBatchThreshold 小批量阈值
 * @param {number} batchCount 生产趟数
 * @returns {number} 加工费用
 */
export function calculateProcessingFee(
  tonnage: number,
  shots: number,
  minBatchThreshold: number,
  batchCount: number,
): number {
  // TODO:
  // 1. 计算基础加工费：
  //    - 按模次计费
  //    - 费率由机器吨位决定
  const machineFeeItem = getMachineByTonnage(tonnage);
  if (!machineFeeItem) {
    throw new Error("机器吨位对应的加工费不能为空");
  }

  if (tonnage <= 0 || shots <= 0 || minBatchThreshold <= 0 || batchCount <= 0) {
    throw new Error("参数不能为负数或0");
  }

  // 基础费率计算（示例：每吨位每模次0.5元）
  const baseRate = machineFeeItem.machiningFee;
  let baseFee = baseRate * shots;

  // 2. 计算小批量费用：
  //    - 当单趟生产模次 < 阈值时收取
  //    - 费用和吨位相关
  //    - 按生产趟数收取
  const shotsPerBatch = shots / batchCount;
  if (shotsPerBatch < minBatchThreshold) {
    // 小批量附加费率
    const smallBatchRate = machineFeeItem.smallBatchMachiningFee;
    const smallBatchFee = smallBatchRate * batchCount;
    baseFee += smallBatchFee;
  }

  return baseFee;
}

/**
 * 计算产品总售价
 * @param {number} materialCost 材料成本
 * @param {number} wastage 损耗费用
 * @param {number} processingFee 加工费用
 * @param {number} profitRate 产品利润系数
 * @returns {number} 产品总售价
 */
export function calculateProductTotalPrice(
  materialCost: number,
  wastage: number,
  processingFee: number,
  profitRate: number,
): number {
  // TODO:
  // 1. 产品总售价 = (总产品材料成本 + 总损耗费用 + 总加工成本) × (1 + 产品利润系数)
  if (
    materialCost <= 0 ||
    wastage <= 0 ||
    processingFee <= 0 ||
    profitRate <= 0
  ) {
    throw new Error("成本不能为负数或0");
  }
  return (materialCost + wastage + processingFee) * getProductProfitRate();
}

/**
 * 计算风险调整后的总费用
 * @param {number} baseCost 基础总费用
 * @param {number} riskScore 风险评分
 * @returns {number} 风险调整后的总费用
 */
export function calculateRiskAdjustedCost(
  baseCost: number,
  riskScore: number,
): number {
  // TODO:
  // 1. 根据风险评分确定调整系数：
  //    - 低风险（0-30分）：无需调整
  //    - 中等风险（31-60分）：基础费用 × (1 + 0.1)
  //    - 高风险（61-80分）：基础费用 × (1 + 0.2)
  //    - 极高风险（>80分）：基础费用 × (1 + 0.3)
  if (baseCost <= 0 || riskScore <= 0) {
    throw new Error("成本跟风险评分不能为负数或0");
  }
  if (riskScore <= 30) {
    return baseCost;
  }
  if (riskScore <= 60) {
    return baseCost * (1 + 0.1);
  }
  if (riskScore <= 80) {
    return baseCost * (1 + 0.2);
  }
  return baseCost * (1 + 0.3);
}

/**
 * 计算单件产品的材料成本
 * @param {number} productNetVolume 产品净体积
 * @param {number} productMaterialDensity 产品材��密度
 * @param {number} productMaterialUnitPrice 产品材料单价
 * @returns {number} 单件产品材料成本
 */
export function calculateProductMaterialCostOld(
  productNetVolume: number,
  productMaterialDensity: number,
  productMaterialUnitPrice: number,
): number {
  // 伪代码
  if (
    !productNetVolume ||
    !productMaterialDensity ||
    !productMaterialUnitPrice
  ) {
    throw new Error("产品净体积、材料密度或材料单价不能为空");
  }
  const productWeight = productNetVolume * productMaterialDensity;
  return productWeight * productMaterialUnitPrice;
}

/**
 * 根据数量和单件成本计算总产品成本
 * @param {number} productQuantity 产品数量
 * @param {number} singleProductCost 单件产品成本
 * @returns {number} 总产品成本
 */
export function calculateProductTotalCost(
  productQuantity: number,
  singleProductCost: number,
): number {
  // 伪代码
  if (productQuantity <= 0 || singleProductCost <= 0) {
    throw new Error("产品数量或单件产品成本不能为负数或0");
  }
  return productQuantity * singleProductCost;
}

/**
 * 计算产品成本
 * @param {number} materialCost 材料成本
 * @param {number} processingCost 加工成本
 * @returns {number} 产品成本
 */
export function calculateProductCost(
  materialCost: number,
  processingCost: number,
): number {
  if (materialCost <= 0 || processingCost <= 0) {
    throw new Error("材料成本或加工成本不能为负数或0");
  }
  return materialCost + processingCost;
}

/**
 * 计算产品加工成本
 * @param {number} machineHourRate 机器小时费率
 * @param {number} cycleTime 成型周期
 * @param {number} laborCost 人工成本
 * @returns {number} 加工成本
 */
export function calculateProcessingCost(
  machineHourRate: number,
  cycleTime: number,
  laborCost: number,
): number {
  // 伪代码：加工成本 = 机器费用 + 人工成本
  return 0;
}

/**
 * 计算生产加工费用
 * @param {number} tonnage 机器吨位
 * @param {number} shots 模次
 * @param {ProcessingFeeConfig} config 加工费用配置
 * @returns {number} 加工费用
 */
export function calculateProductionProcessingFee(
  tonnage: number,
  shots: number,
  config: ProcessingFeeConfig,
): number {
  // 伪代码：计算基础加工费和小批量费用
  const machineFeeItem = getMachineByTonnage(tonnage);
  if (!machineFeeItem) {
    throw new Error("机器吨位对应的加工费不能为空");
  }
  const baseRate = machineFeeItem.machiningFee;
  const baseFee = baseRate * shots;
  let processingFee = 0;
  if (shots < config.minBatchThreshold) {
    processingFee = shots * machineFeeItem.smallBatchMachiningFee;
  }
  return baseFee + processingFee;
}

/**
 * 计算风险调整后的总费用
 * @param {number} baseCost 基础总费用
 * @param {RiskAssessment} riskAssessment 风险评估结果
 * @returns {number} 风险调整后的总费用
 */
export function calculateRiskAdjustedCostOld(
  baseCost: number,
  riskAssessment: RiskAssessment,
): number {
  // 伪代码：最终总费用 = 基础总费用 × (1 + 风险调整系数)
  if (baseCost <= 0 || riskAssessment.score <= 0) {
    throw new Error("基础总费用或风险评分不能为负数或0");
  }
  //按照之前的规则计算风险分
  if (riskAssessment.score <= 30) {
    return baseCost;
  }
  if (riskAssessment.score <= 60) {
    return baseCost * (1 + 0.1);
  }
  if (riskAssessment.score <= 80) {
    return baseCost * (1 + 0.2);
  }
  return baseCost * (1 + 0.3);
}
