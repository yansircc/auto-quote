import { injectionSafetyFactor } from "src/lib/constants/price-constant";

/**
 * 计算产品净体积
 * @param {{width: number; height: number; depth: number}} productDimensions 产品尺寸
 * @returns {number} 净体积
 */
export function calculateProductNetVolume(productDimensions: {
  width: number;
  height: number;
  depth: number;
}): number {
  // TODO:
  // 1. 根据产品的宽度、高度、深度计算净体积
  // 2. 净体积用于计算材料成本
  if (!productDimensions) {
    throw new Error("产品尺寸不能为空");
  }
  if (productDimensions.width <= 0 || productDimensions.height <= 0 || productDimensions.depth <= 0) {
    throw new Error("产品尺寸不能为负数或0");
  }
  const productVolume = productDimensions.width * productDimensions.height * productDimensions.depth;
  //四舍五入保留三位小数
  return Number(productVolume.toFixed(3));
}

/**
 * 计算产品包络体积（可以理解为产品占据的最大外形体积）
 * @param {{width: number; height: number; depth: number}} productDimensions 产品尺寸
 * @returns {number} 包络体积
 */
export function calculateProductBoundingVolume(productDimensions: {
  width: number;
  height: number;
  depth: number;
}): number {
  // TODO:
  // 1. 根据产品的宽度、高度、深度计算包络体积
  // 2. 包络体积用于布局优化和模具尺寸计算
  if (!productDimensions) {
    throw new Error("产品尺寸不能为空");
  }
  if (productDimensions.width <= 0 || productDimensions.height <= 0 || productDimensions.depth <= 0) {
    throw new Error("产品尺寸不能为负数或0");
  }
  const productVolume = productDimensions.width * productDimensions.height * productDimensions.depth;
  //四舍五入保留三位小数
  return Number(productVolume.toFixed(3));

}

/**
 * 计算注胶体积
 * @param {number} netVolume 净体积
 * @param {number} safetyFactor 安全系数 (默认0.8)
 * @returns {number} 安全注胶体积
 */
export function calculateInjectionVolume(
  netVolume: number,
): number {
  // TODO:
  // 1. 安全注胶体积 = 净体积 / 安全系数
  // 2. 用于确定机器吨位和加工费用
  if (netVolume <= 0) {
    throw new Error("净体积不能为负数或0");
  }
  return netVolume / injectionSafetyFactor;
}
