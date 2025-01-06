import type { MachineConfig } from "../core";
import { calculateTotalSmallBatchFee } from "./small-batch";

/**
 * 计算机器费用
 * @param {number[]} seperateShots 各模次
 * @param {MachineConfig} config 机器配置
 * @returns {number} 机器费用
 */
export function getTotalMachineProcessingFee(
  seperateShots: number[],
  config: MachineConfig,
): number {
  const totalSmallBatchFee = calculateTotalSmallBatchFee(seperateShots, config);
  const processingFee =
    seperateShots.reduce((acc, cur) => acc + cur, 0) * config.costPerShots;

  console.log("totalSmallBatchFee", totalSmallBatchFee);
  console.log("processingFee", processingFee);
  return totalSmallBatchFee + processingFee;
}
