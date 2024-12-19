import type { Product } from "../product/types";
import type { MachineConfig, ProcessingConfig } from "./types";
import { getTonnageRate } from "./tonnage";

/**
 * 根据机器吨位计算每模次的加工费用
 * @param {number} machineTonnage 机器吨位
 * @returns {number} 每模次费用
 */
export function calculateOperationCostPerShot(machineTonnage: number): number {
  // 伪代码
  return 0;
}

/**
 * 计算基础加工费
 * @param {number} tonnage 机器吨位
 * @param {number} shots 模次
 * @param {MachineConfig} config 机器配置
 * @returns {number} 基础加工费
 */
export function calculateBaseProcessingFee(
  tonnage: number,
  shots: number,
  config: MachineConfig,
): number {
  return 0;
}

/**
 * 计算多产品组合的基础加工费
 * 注意：当材料、颜色不一样时，需要单独顺序生产
 * 加工费取决于模具的总尺寸和注胶量最大的产品
 * @param {Product[]} products 产品列表
 * @param {number[]} shots 每个产品的模次
 * @param {number} maxTonnage 最大所需吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 基础加工费
 */
export function calculateGroupProcessingFee(
  products: Product[],
  shots: number[],
  maxTonnage: number,
  config: MachineConfig,
): number {
  // 当产品颜色不同时，需要分别生产
  // 总加工费 = 每个产品的模次 × 费率
  return 0;
}

/**
 * 计算基础加工费
 * @param {Product[]} products 产品列表
 * @param {number} shots 模次
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @param {ProcessingConfig} processingConfig 加工配置
 * @returns {number} 基础加工费
 */
export function calculateBasicOperationCost(
  products: Product[],
  shots: number,
  tonnage: number,
  config: MachineConfig,
  processingConfig: ProcessingConfig,
): number {
  // TODO:
  // 1. 根据价格指南，当材料、颜色不一样时，需要分批次顺序生产
  // 2. 加工费取决于：
  //    a. 模具的总尺寸（需要从products计算得出）
  //    b. 三个产品中注胶量最大的那款产品
  // 3. 需要考虑：
  //    a. 不同材料的标准周期时间
  //    b. 产品体积对周期时间的影响
  //    c. 机器吨位对费率的影响
  return 0;
}

/**
 * 获取最大注胶量产品
 * @param {Product[]} products 产品列表
 * @returns {Product} 注胶量最大的产品
 */
export function getMaxInjectionVolumeProduct(products: Product[]): Product {
  // TODO:
  // 1. 遍历所有产品计算注胶量
  // 2. 返回注胶量最大的产品
  // 3. 需要考虑产品为空的情况
  return products[0]!;
}

/**
 * 计算生产批次
 * @param {Product[]} products 产品列表
 * @returns {Product[][]} 按材料和颜色分组的产品批次
 */
export function calculateProductionBatches(products: Product[]): Product[][] {
  // TODO:
  // 1. 按材料分组
  // 2. 在材料组内按颜色分组
  // 3. 每个组就是一个生产批次
  return [products];
}

/**
 * 计算每个批次的加工费
 * @param {Product[][]} batches 产品批次
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @param {ProcessingConfig} processingConfig 加工配置
 * @returns {number} 总加工费
 */
export function calculateBatchOperationCosts(
  batches: Product[][],
  tonnage: number,
  config: MachineConfig,
  processingConfig: ProcessingConfig,
): number {
  // TODO:
  // 1. 遍历每个批次
  // 2. 计算每个批次的模次
  // 3. 计算每个批次的基础加工费
  // 4. 累加所有批次的加工费
  return 0;
}
