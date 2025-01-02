import { calculateMinArea } from "./min-area";
import type { BaseCuboid, CuboidLayout } from "../types";

export const DEFAULT_SPACING = 30;

/**
 * 获取笛卡尔坐标系的3D布局结果，注意，所有立方体都顶端对齐，所有的顶都在 z = 0 那条线上
 *
 * @param cuboids - 一组立方体
 * @returns {CuboidLayout[]} 3D布局结果，返回的是顶端对齐的布局
 */
export function getTopAlignedCuboidsLayout(
  cuboids: BaseCuboid[],
): CuboidLayout[] {
  // 获取2D布局（xy平面）
  const xyLayout = calculateMinArea(
    cuboids.map((cuboid) => ({
      width: cuboid.width,
      height: cuboid.depth, // 注意这里用 depth 作为 2D 布局的 height
    })),
    {
      spacing: {
        getPackingSize: (rect) => ({
          ...rect,
          width: rect.width + DEFAULT_SPACING, // 只在右侧和底部添加30px间距
          height: rect.height + DEFAULT_SPACING,
        }),
        getActualPosition: (x, y) => ({
          x: x + DEFAULT_SPACING / 2, // 向右偏移15px（半间距）
          y: y + DEFAULT_SPACING / 2, // 向上偏移15px（半间距）
        }),
      },
    },
  ).layout;

  // 计算实际布局的外包围框（去除边缘间距）
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  xyLayout.forEach((rect) => {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });

  // 转换为3D布局，使用笛卡尔坐标系，z=0为顶面
  return xyLayout.map((rect): CuboidLayout => {
    const originalCuboid = cuboids[rect.index!];

    if (!originalCuboid) {
      throw new Error("Original cuboid not found");
    }

    // 确保 width >= depth
    const width = Math.max(rect.width, rect.height);
    const depth = Math.min(rect.width, rect.height);

    return {
      dimensions: {
        width, // 确保 width >= depth
        depth, // 2D layout 中的 height 对应 3D 的 depth
        height: originalCuboid.height,
      },
      position: {
        x: rect.x - minX, // 调整x坐标，去除左侧间距
        y: rect.y - minY, // 调整y坐标，去除底部间距
        z: -originalCuboid.height, // 顶面在 z=0，所以底面在 -height
      },
      index: rect.index!,
    };
  });
}

export function getBoundingBox(layouts: CuboidLayout[]): CuboidLayout {
  if (layouts.length === 0) {
    throw new Error("Cannot calculate bounding box for empty layout");
  }

  // 计算每个立方体的边界点
  const bounds = layouts.map((layout) => {
    return {
      minX: layout.position.x,
      maxX: layout.position.x + layout.dimensions.width,
      minY: layout.position.y,
      maxY: layout.position.y + layout.dimensions.depth,
      minZ: layout.position.z,
      maxZ: layout.position.z + layout.dimensions.height,
    };
  });

  // 计算整体的边界
  const minX = Math.min(...bounds.map((b) => b.minX));
  const maxX = Math.max(...bounds.map((b) => b.maxX));
  const minY = Math.min(...bounds.map((b) => b.minY));
  const maxY = Math.max(...bounds.map((b) => b.maxY));
  const minZ = Math.min(...bounds.map((b) => b.minZ));
  const maxZ = Math.max(...bounds.map((b) => b.maxZ));

  // 返回包围盒（使用左下角坐标）
  return {
    dimensions: {
      width: maxX - minX,
      depth: maxY - minY,
      height: maxZ - minZ,
    },
    position: {
      x: minX,
      y: minY,
      z: minZ,
    },
    index: 0, // 随便给个值, 此处的 index 是无效的
  };
}
