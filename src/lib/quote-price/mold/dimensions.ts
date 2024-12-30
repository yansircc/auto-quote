import { getSafeEdgeThickness, getSafeBottomThickness } from "../core";
import type { Dimensions } from "../core";

/**
 * 计算模具的实际尺寸
 * @param {Dimensions} dimensions 模具尺寸
 * @returns {Dimensions} 模具的实际尺寸
 */
export function getMoldDimensions(dimensions: Dimensions): Dimensions {
  const extraWidth = getSafeEdgeThickness(dimensions.width);
  const extraDepth = getSafeEdgeThickness(dimensions.depth);
  const extraHeight = getSafeBottomThickness(dimensions.height);

  return {
    width: dimensions.width + extraWidth * 2,
    depth: dimensions.depth + extraDepth * 2,
    height: dimensions.height + extraHeight,
  };
}
