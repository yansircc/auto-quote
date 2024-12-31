import type { MachineConfig } from "../core";

/**
 * 计算小批量费用
 * @param {number} shots 模次数
 * @param {MachineConfig} config 机器配置
 * @returns {number} 小批量费用
 *
 * 注意：因为已经做了是否大于阈值的判断，所以可正常写入主流程
 */
function calculateSmallBatchFee(shots: number, config: MachineConfig): number {
  // 获取小批量阈值，使用配置中的值或默认值
  const smallBatchThreshold = config.smallBatch.threshold;

  // 如果模次数大于等于阈值，不收取小批量费用
  if (shots >= smallBatchThreshold) {
    return 0;
  }

  // 获取小批量费率
  const rate = config.smallBatch.rate;

  // 计算小批量费用：(阈值 - 实际模次) * 费率
  return (smallBatchThreshold - shots) * rate;
}

/**
 * 计算多趟生产的小批量费用总和
 * @param {number[]} batchShots 每趟的模次数组
 * @param {MachineConfig} config 机器配置
 * @returns {number} 小批量费用总和
 *
 * 注意：因为已经做了是否大于阈值的判断，所以可正常写入主流程
 */
export function calculateTotalSmallBatchFee(
  batchShots: number[],
  config: MachineConfig,
): number {
  if (!batchShots.length) {
    throw new Error("模次数组不能为空");
  }

  return batchShots.reduce((sum, shots) => {
    return sum + calculateSmallBatchFee(shots, config);
  }, 0);
}
