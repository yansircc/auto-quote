import potpack from "potpack";
import type { Rectangle2D } from "@/types/core/geometry";
import type {
  AreaResult,
  PlacedRectangle,
} from "@/types/algorithm/layout/types";
import { calculateSpacing } from "./utils/spacing";

interface PotpackBox {
  w: number;
  h: number;
  index: number;
  isRotated?: boolean;
}

interface PackedBox extends PotpackBox {
  x: number;
  y: number;
}

interface PotpackResult {
  w: number;
  h: number;
  fill: number;
}

interface PackResult {
  result: PotpackResult;
  boxes: PackedBox[];
}

function sortRectangles(rectangles: Rectangle2D[]): Rectangle2D[] {
  // 首先按面积排序
  return [...rectangles].sort((a, b) => {
    const areaA = a.width * a.length;
    const areaB = b.width * b.length;
    if (Math.abs(areaA - areaB) > 100) {
      // 如果面积差异显著
      return areaB - areaA; // 大的在前
    }
    // 面积相近时，优先考虑更方的矩形
    const ratioA = Math.max(a.width / a.length, a.length / a.width);
    const ratioB = Math.max(b.width / b.length, b.length / b.width);
    return ratioA - ratioB;
  });
}

function tryAllRotations(
  rectangles: Rectangle2D[],
  spacing: number,
): PackResult {
  const n = rectangles.length;
  const totalCombinations = 1 << n; // 2^n combinations
  let bestArea = Number.MAX_VALUE;
  let bestResult: PackResult | null = null;
  let bestFill = 0;

  // 对矩形进行排序
  const sortedRectangles = sortRectangles(rectangles);

  // 创建原始索引映射
  const indexMap = new Map(
    sortedRectangles.map((rect, i) => [
      rect,
      rectangles.findIndex(
        (r) => r.width === rect.width && r.length === rect.length,
      ),
    ]),
  );

  // Try all possible rotation combinations
  for (let mask = 0; mask < totalCombinations; mask++) {
    const boxes: PotpackBox[] = sortedRectangles.map((rect, index) => {
      const shouldRotate = (mask & (1 << index)) !== 0;
      // 为每个矩形选择更合适的方向
      const preferRotation = rect.width < rect.length;
      const finalRotation = shouldRotate !== preferRotation; // XOR操作

      return {
        w: (finalRotation ? rect.length : rect.width) + spacing,
        h: (finalRotation ? rect.width : rect.length) + spacing,
        index: indexMap.get(rect) ?? index,
        isRotated: finalRotation,
      };
    });

    const packResult = potpack(boxes);
    const area = packResult.w * packResult.h;
    const usedArea = boxes.reduce((sum, box) => sum + box.w * box.h, 0);
    const fill = usedArea / area;

    // 评估布局质量
    const quality =
      area * (1 + Math.abs(packResult.w / packResult.h - 1) * 0.1);

    if (
      quality < bestArea ||
      (Math.abs(quality - bestArea) < 100 && fill > bestFill)
    ) {
      bestArea = quality;
      bestFill = fill;
      bestResult = {
        result: packResult,
        boxes: boxes as PackedBox[],
      };
    }
  }

  if (!bestResult) {
    throw new Error("Failed to find any valid packing");
  }

  return bestResult;
}

/**
 * 计算最小面积布局
 * @param rectangles 输入的矩形列表
 * @returns 计算结果，包含布局信息
 */
export function calculateMinArea(rectangles: Rectangle2D[]): AreaResult {
  if (!rectangles.length) {
    return {
      width: 0,
      length: 0,
      area: 0,
      rotation: false,
      spacing: 0,
      layout: [],
    };
  }

  // 计算最大尺寸来确定间距
  const maxDimension = Math.max(
    ...rectangles.map((rect) => Math.max(rect.width, rect.length)),
  );
  const spacing = calculateSpacing(maxDimension);

  // 尝试所有可能的旋转组合
  const { result: finalPack, boxes: finalBoxes } = tryAllRotations(
    rectangles,
    spacing,
  );

  // 转换回我们的格式
  const layout: PlacedRectangle[] = finalBoxes.map((box) => {
    const originalRect = rectangles[box.index];
    if (!originalRect) {
      throw new Error(`Invalid index ${box.index}`);
    }

    return {
      x: box.x,
      y: box.y,
      width: box.isRotated ? originalRect.length : originalRect.width,
      length: box.isRotated ? originalRect.width : originalRect.length,
      rotated: !!box.isRotated,
      originalIndex: box.index,
    };
  });

  // Log the final layout for debugging
  console.log(
    "Final layout:",
    layout.map((rect) => ({
      ...rect,
      area: rect.width * rect.length,
    })),
  );

  return {
    width: finalPack.w - spacing,
    length: finalPack.h - spacing,
    area: (finalPack.w - spacing) * (finalPack.h - spacing),
    rotation: layout.some((rect) => rect.rotated),
    spacing,
    layout,
  };
}
