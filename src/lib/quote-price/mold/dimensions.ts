import type { Product } from "../product/types";
import { getHeightByDimensions, getMarginByWidth } from "./common";
import { calculateMinArea } from "./layout/min-area";
import type { MoldDimensions } from "./types";

/**
 * 根据输入参数计算模具体积
 * @param {MoldDimensions} dimensions 模具尺寸
 * @returns {number} 模具体积
 */
export function calculateMoldVolume(dimensions: MoldDimensions): number {
  // 伪代码：计算模具体积
  // TODO:
  // 1. 体积 = 宽度 × 高度 × 深度
  if (!dimensions) {
    return 0;
  }
  return dimensions.width * dimensions.height * dimensions.depth;
}


/**
 * 计算模具尺寸
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @returns {MoldDimensions} 模具尺寸
 */
export function calculateMoldDimensions(
  products: Product[],
  cavities: number[],
): MoldDimensions {
  // 伪代码：计算最终模具尺寸
  // TODO:
  // 1. 计算最小布局宽度和深度
  // 2. 找到最大产品高度
  // 3. 加上边缘裕度和高度裕度

  const minAreaResult = calculateMinArea(products.map((product) => ({
    width: product.dimensions.width,
    height: product.dimensions.height,
  })));

  const addedHeight = getHeightByDimensions(minAreaResult?.layout[0]?.width ?? 0, minAreaResult?.layout[0]?.height ?? 0);

  const margin = getMarginByWidth(minAreaResult?.layout[0]?.width ?? 0);
  return {
    width: minAreaResult?.layout[0]?.width ?? 0 + margin * 2,
    height: minAreaResult?.layout[0]?.height ?? 0 + addedHeight,
    depth: 0,
  };
}

/**
 * 根据穴数和产品尺寸计算模具的长宽高
 * @param {number} cavityCount 穴数
 * @param {{width: number; height: number; depth: number}} productDimensions 产品尺寸
 * @returns {{width: number; height: number; depth: number}} 模具尺寸
 */
export function calculateMoldDimensionsByCavity(
  cavityCount: number,
  productDimensions: { width: number; height: number; depth: number },
): { width: number; height: number; depth: number } {
  // 伪代码：根据穴数和产品尺寸计算模具尺寸
  
  if (cavityCount <= 0) {
    throw new Error("穴数不能为负数或0");
  }

  if (productDimensions.width <= 0 || productDimensions.height <= 0) {
    throw new Error("产品尺寸不能为负数");
  }

  return { width: 0, height: 0, depth: 0 };
}
