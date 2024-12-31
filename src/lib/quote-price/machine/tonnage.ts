import { machineList } from "../core";
import type { MachineConfig, Dimensions } from "../core";

/**
 * 计算注胶总量是否在安全范围内
 * @param {number} totalInjectionWeight 注胶总质量
 * @param {MachineConfig} config 机器配置
 * @returns {boolean} 是否在安全范围内
 */
function isSafeInjectionWeight(
  totalInjectionWeight: number,
  config: MachineConfig,
): boolean {
  if (totalInjectionWeight <= 0) {
    throw new Error("注胶量不能小于等于0");
  }
  return (
    totalInjectionWeight <=
    config.injection.maxWeight * config.injection.safetyFactor
  );
}

/**
 * 计算模具宽度和高度是否在安全范围内
 * @param {Dimensions} dimension 模具尺寸
 * @param {MachineConfig} config 机器配置
 * @returns {boolean} 是否在安全范围内
 */
function isSafeDimension(
  dimension: Dimensions,
  config: MachineConfig,
): boolean {
  if (dimension.width <= 0 || dimension.height <= 0 || dimension.depth <= 0) {
    throw new Error("模具尺寸不能小于等于0");
  }
  const actualWidth = Math.min(dimension.width, dimension.depth);
  return (
    actualWidth <= config.mold.maxWidth &&
    dimension.height <= config.mold.maxHeight
  );
}

/**
 * 根据模具尺寸与注胶量确定需要的最小费率的机器
 * @param {Dimensions} moldDimension 模具尺寸
 * @param {number} injectionWeight 注胶总质量
 * @returns {MachineConfig} 最小费率的机器
 */
export function getCheapestMachine(
  moldDimension: Dimensions,
  injectionWeight: number,
): MachineConfig {
  // 找到所有符合条件的机器
  const suitableMachines = machineList.filter((machine) => {
    return (
      isSafeDimension(moldDimension, machine) &&
      isSafeInjectionWeight(injectionWeight, machine)
    );
  });

  // 按吨位费率从小到大排序，返回第一个（最小费率）
  const sortedMachines = suitableMachines.sort(
    (a, b) => a.costPerShots - b.costPerShots,
  );
  const cheapestMachine = sortedMachines[0];

  if (!cheapestMachine) {
    throw new Error("无法找到最小费率的机器");
  }

  return cheapestMachine;
}
