import type { Product } from "../../product/types";
import type { CavityConfig } from "../types";

/**
 * 获取穴数约束条件
 * @param {Product[]} products 产品列表
 * @returns {{ minCavities: number; maxCavities: number; cavityStep: number; balanceRequired: boolean }}
 */
export function getCavityConstraints(products: Product[]): {
  minCavities: number;
  maxCavities: number;
  cavityStep: number;
  balanceRequired: boolean;
} {
  // 伪代码：根据产品特性确定穴数约束
  return {
    minCavities: 1,
    maxCavities: 8,
    cavityStep: 2,
    balanceRequired: true,
  };
}

/**
 * 检查穴数是否满足约束
 * @param {number[]} cavities 穴数列表
 * @param {{ minCavities: number; maxCavities: number; cavityStep: number; balanceRequired: boolean }} constraints 约束条件
 * @returns {boolean} 是否满足约束
 */
export function checkCavityConstraints(
  cavities: number[],
  constraints: {
    minCavities: number;
    maxCavities: number;
    cavityStep: number;
    balanceRequired: boolean;
  },
): boolean {
  // 伪代码：检查穴数是否满足所有约束条件
  return true;
}

/**
 * 计算穴数取值范围
 * @param {Product} product 产品信息
 * @returns {[number, number]} [最小穴数, 最大穴数]
 */
export function calculateCavityRange(product: Product): [number, number] {
  // TODO:
  // 1. 根据产品尺寸计算单穴占用空间
  // 2. 根据模具最大尺寸限制计算最大穴数
  // 3. 根据机器吨位限制计算最大穴数
  // 4. 返回合理的穴数范围
  return [0, 0];
}

/**
 * 检查穴数比例是否合理
 * @param {number[]} cavities 穴数列表
 * @param {CavityConfig} config 配置
 * @returns {boolean} 是否合理
 */
export function checkCavityRatio(
  cavities: number[],
  config: CavityConfig,
): boolean {
  // TODO:
  // 1. 检查任意两个产品的穴数比例
  // 2. 确保比例在配置的范围内
  return false;
}
