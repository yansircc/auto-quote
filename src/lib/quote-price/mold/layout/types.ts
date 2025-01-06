import type { PotpackBox } from "potpack";

/**
 * 矩形定义
 */
interface Rectangle {
  id: number;
  width: number;
  height: number;
}

/**
 * 带位置信息的矩形
 */
interface PlacedRectangle extends Rectangle {
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
  id: number;
  originalRect: Rectangle;
  isRotated: boolean;
}

interface BaseCuboid extends Rectangle {
  depth: number;
}

/**
 * 3D布局结果，使用笛卡尔坐标系
 */
interface CuboidLayout {
  id: number;
  dimensions: {
    width: number; // x
    depth: number; // y
    height: number; // z
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export type {
  Rectangle,
  PlacedRectangle,
  LayoutResult,
  LayoutOptions,
  SpacingCalculator,
  Box,
  BaseCuboid,
  CuboidLayout,
};
