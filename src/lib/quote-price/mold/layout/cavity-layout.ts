import { calculateMinArea } from "./min-area";
import { cavitySpacing } from "./cavity-spacing";
import type { Rectangle, PlacedRectangle, LayoutResult } from "./types";

/**
 * 计算腔体的布局
 * 包含业务逻辑：添加间距、计算边界、平移到原点等
 */
export function calculateCavityLayout(rectangles: Rectangle[]): LayoutResult {
  // 首先使用min-area进行基础布局
  const baseResult = calculateMinArea(rectangles, {
    spacing: cavitySpacing,
  });

  // 找出所有实际矩形的边界
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  baseResult.layout.forEach((rect) => {
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;

    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  // 平移所有矩形到原点
  const layout: PlacedRectangle[] = baseResult.layout.map((rect) => ({
    ...rect,
    x: rect.x - minX,
    y: rect.y - minY,
  }));

  return {
    width: maxX - minX,
    height: maxY - minY,
    layout,
  };
}
