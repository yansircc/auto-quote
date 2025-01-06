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
  console.log("seperateShots", seperateShots);
  console.log("totalSmallBatchFee", totalSmallBatchFee);
  return (
    seperateShots.reduce((acc, cur) => acc + cur, 0) * config.costPerShots +
    totalSmallBatchFee
  );
}
