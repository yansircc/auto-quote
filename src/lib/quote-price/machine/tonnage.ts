import type { Product } from "../product/types";
import type { MachineConfig } from "./types";
import {
  calculateInjectionVolume,
  calculateSafeInjectionVolume,
} from "./injection";
import { machineList } from "src/lib/constants/price-constant";

/**
 * 根据模具尺寸与注胶量确定需要的机器吨位
 * @param {number} moldWidth 模具宽度
 * @param {number} moldHeight 模具高度
 * @param {number} moldDepth 模具深度
 * @param {number} injectionVolume 注胶量
 * @returns {number} 机器吨位
 */
export function determineMachineTonnage(
  moldWidth: number,
  moldHeight: number,
  moldDepth: number,
  injectionVolume: number,
): number {
  // 伪代码
  if(moldWidth <= 0 || moldHeight <= 0 || moldDepth <= 0) {
    throw new Error('模具尺寸不能为零跟负数');
  }

  if(injectionVolume <= 0) {
    throw new Error('注胶量不能为零跟负数');
  }

  const moldWidthActual = Math.min(moldWidth, moldDepth);
  const eligibleMachines = machineList
      .filter(machine => 
        moldWidthActual <= machine.moldWidth &&
        moldHeight <= machine.moldHeight &&
        (injectionVolume / 0.8) <= machine.injectionVolume
      )
      .sort((a, b) => {
        const aValue = parseInt(a.name.replace('T', ''));
        const bValue = parseInt(b.name.replace('T', ''));
        return aValue - bValue;
      });

  if(eligibleMachines.length > 0) {
    const machineName = eligibleMachines[0]?.name ?? '';
    return parseInt(machineName.replace('T', ''));
  }
  else {
    throw new Error('没有合适的机器');
  }
}

/**
 * 计算所需机器吨位
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @param {MachineConfig} config 机器配置
 * @returns {number} 所需吨位
 */
export function calculateRequiredTonnage(
  products: Product[],
  cavities: number[],
  config: MachineConfig,
): number {
  // TODO:
  // 1. 计算总注胶量
  // 2. 计算安全注胶量
  // 3. 根据安全注胶量确定所需吨位
  const injectionVolume = calculateInjectionVolume(products, cavities);
  const safeInjectionVolume = calculateSafeInjectionVolume(
    injectionVolume,
    config,
  );
  return determineMachineTonnage(0, 0, 0, safeInjectionVolume);
}

/**
 * 检查吨位是否在机器范围内
 * @param {number} tonnage 计算得出的吨位
 * @param {MachineConfig} config 机器配置
 * @returns {boolean} 是否在范围内
 */
export function checkTonnageInRange(
  tonnage: number,
  config: MachineConfig,
): boolean {
  const [minTonnage, maxTonnage] = config.tonnageRange;
  return tonnage >= minTonnage && tonnage <= maxTonnage;
}

/**
 * 获取吨位对应的费率
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 费率
 */
export function getTonnageRate(tonnage: number, config: MachineConfig): number {
  // TODO:
  // 1. 在吨位阈值数组中找到对应区间
  // 2. 返回该区间对应的费率
  return 0;
}

/**
 * 计算最佳机器吨位
 * @param {number} requiredTonnage 所需吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 最佳吨位
 */
export function calculateOptimalTonnage(
  requiredTonnage: number,
  config: MachineConfig,
): number {
  // TODO:
  // 1. 在满足所需吨位的前提下
  // 2. 选择成本最优的机器吨位
  // 3. 考虑机器的利用率
  return 0;
}
