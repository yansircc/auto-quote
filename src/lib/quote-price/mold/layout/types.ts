import type { PotpackBox } from "potpack";

/**
 * 矩形定义
 */
interface Rectangle {
  width: number;
  height: number;
}

/**
 * 带位置信息的矩形
 */
interface PlacedRectangle extends Rectangle {
  index: number;
  x: number; // 左上角x坐标
  y: number; // 左上角y坐标
}

/**
 * 布局结果
 */
interface LayoutResult {
  width: number;
  height: number;
  layout: PlacedRectangle[];
}

/**
 * 间距计算器
 */
interface SpacingCalculator {
  /**
   * 计算打包时的尺寸（包含间距）
   */
  getPackingSize(rect: Rectangle): Rectangle;

  /**
   * 计算实际位置（减去间距）
   */
  getActualPosition(x: number, y: number): { x: number; y: number };
}

/**
 * 布局选项
 */
interface LayoutOptions {
  maxIterations?: number;
  allowRotation?: boolean;
  spacing?: SpacingCalculator;
}

/**
 * 打包用的矩形
 */
interface Box extends PotpackBox {
  originalIndex: number;
  originalRect: Rectangle;
  isRotated: boolean;
}

export type {
  Rectangle,
  PlacedRectangle,
  LayoutResult,
  LayoutOptions,
  SpacingCalculator,
  Box,
};
