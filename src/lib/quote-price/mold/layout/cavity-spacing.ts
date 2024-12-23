import type { Rectangle, SpacingCalculator } from "./types";

/**
 * 固定的腔体间距
 */
const CAVITY_MARGIN = 15;

/**
 * 腔体间距计算器
 */
export const cavitySpacing: SpacingCalculator = {
  /**
   * 计算打包时的尺寸（包含间距）
   */
  getPackingSize(rect: Rectangle): Rectangle {
    return {
      width: rect.width + 2 * CAVITY_MARGIN,
      height: rect.height + 2 * CAVITY_MARGIN,
    };
  },

  /**
   * 计算实际位置（减去间距）
   */
  getActualPosition(x: number, y: number): { x: number; y: number } {
    return {
      x: x + CAVITY_MARGIN,
      y: y + CAVITY_MARGIN,
    };
  },
};
