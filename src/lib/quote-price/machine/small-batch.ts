import type { MachineConfig } from "./types";
import { getTonnageRate } from "./tonnage";

/**
 * 计算小批量费用
 * @param {number} shots 模次数
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 小批量费用
 */
export function calculateSmallBatchFee(
  shots: number,
  tonnage: number,
  config: MachineConfig,
): number {
  // TODO:
  // 1. 检查是否达到小批量阈值（默认1000模次）
  // 2. 根据吨位找到对应的费率
  // 3. 计算小批量费用
  return 0;
}

/**
 * 计算多趟生产的小批量费用总和
 * @param {number[]} batchShots 每趟的模次数组
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 小批量费用总和
 */
export function calculateTotalSmallBatchFee(
  batchShots: number[],
  tonnage: number,
  config: MachineConfig,
): number {
  // TODO:
  // 1. 遍历每趟生产的模次
  // 2. 分别计算每趟的小批量费用
  // 3. 求和得到总费用
  return 0;
}
