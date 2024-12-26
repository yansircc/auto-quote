import { calculateMinArea } from "@/lib/quote-price/mold/layout/min-area";
import type { BaseCuboid, CuboidLayout } from "../types";

/**
 * 获取3D布局结果，注意，z原点不一定是立方体底部，现在立方体顶端都在 z = maxHeight 那条线上
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
  ).layout;

  // 转换为3D布局，使用笛卡尔坐标系，z=0为顶面
  return xyLayout.map((rect): CuboidLayout => {
    const originalCuboid = cuboids[rect.index];

    if (!originalCuboid) {
      throw new Error("Original cuboid not found");
    }

    return {
      dimensions: {
        width: rect.width, // 已经在 min-area 中处理过旋转
        depth: rect.height, // 2D layout 中的 height 对应 3D 的 depth
        height: originalCuboid.height,
      },
      position: {
        x: rect.x, // 左下角 x 坐标
        y: rect.y, // 左下角 y 坐标
        z: -originalCuboid.height, // 顶面在 z=0，所以底面在 -height
      },
      index: rect.index,
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
