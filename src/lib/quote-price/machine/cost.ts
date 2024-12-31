import type { MachineConfig } from "../core";
import { calculateTotalSmallBatchFee } from "./small-batch";

/**
 * 计算机器费用
 * @param {number} totalShots 模次数
 * @param {MachineConfig} config 机器配置
 * @returns {number} 机器费用
 */
export function getTotalMachineProcessingFee(
  totalShots: number,
  config: MachineConfig,
): number {
  const totalSmallBatchFee = calculateTotalSmallBatchFee([totalShots], config);
  return totalShots * config.costPerShots + totalSmallBatchFee;
}
