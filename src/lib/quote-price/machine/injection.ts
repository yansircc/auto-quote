import { injectionSafetyFactor } from "src/lib/constants/price-constant";
import type { Product } from "../product/types";
import type { MachineConfig } from "./types";

/**
 * 计算注胶量
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @returns {number} 注胶量
 */
export function calculateInjectionVolume(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 计算每个产品的体积 × 密度 × 穴数
  // 2. 求和得到总注胶量
  if (products.length !== cavities.length) {
    throw new Error('产品和穴数数量不一致');
  }

  const totalVolume = products.reduce((sum, product, index) => {
    const cavity = cavities[index]!;
    const volume = product.netVolume * product.material.density * cavity;
    return sum + volume;
  }, 0);
  return totalVolume;
}

/**
 * 计算安全注胶量
 * @param {number} volume 注胶量
 * @param {MachineConfig} config 机器配置
 * @returns {number} 安全注胶量
 */
export function calculateSafeInjectionVolume(
  volume: number,
  config: MachineConfig,
): number {
  // TODO:
  // 1. 使用安全系数计算安全注胶量
  
  const safeVolume = volume / injectionSafetyFactor;
  
  // TODO: 检查安全注胶量是否超过机器容量
  if (safeVolume > config.maxInjectionVolume) {
    throw new Error('注胶量超过机器最大容量');
  }
  
  return safeVolume;
}
