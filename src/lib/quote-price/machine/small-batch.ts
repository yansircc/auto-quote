import { getMachineByTonnage } from "./common";
import type { MachineConfig } from "./types";
import { smallBatchThresholdValue } from "src/lib/constants/price-constant";

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
  const smallBatchThreshold = config.smallBatchThreshold ?? smallBatchThresholdValue;
  
  // 如果模次数大于等于阈值，不收取小批量费用
  if (shots >= smallBatchThreshold) {
    return 0;
  }

  // 获取对应吨位的费率
  const machine = getMachineByTonnage(tonnage);
  if (!machine) {
    throw new Error('无法找到对应吨位的机器');
  }
  console.log("machine: ", machine)
  const rate = machine.machiningFee ?? 0;
  if (!rate) {
    throw new Error('无法找到对应吨位的费率');
  } 

  // 计算小批量费用：(阈值 - 实际模次) * 费率
  const fee = (smallBatchThreshold - shots) * rate;
  return fee;
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
  if (!batchShots.length) {
    throw new Error('模次数组不能为空');
  }

  // 计算每趟的小批量费用并求和
  const totalFee = batchShots.reduce((sum, shots) => {
    const batchFee = calculateSmallBatchFee(shots, tonnage, config);
    return sum + batchFee;
  }, 0);

  return totalFee;
}
