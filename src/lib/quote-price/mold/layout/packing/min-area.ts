import potpack from "potpack";
import type {
  Box,
  Rectangle,
  PlacedRectangle,
  LayoutResult,
  LayoutOptions,
  SpacingCalculator,
} from "../types";

/**
 * 默认的布局选项
 */
const DEFAULT_OPTIONS: Required<Omit<LayoutOptions, "spacing">> = {
  maxIterations: 8,
  allowRotation: true,
};

/**
 * 默认的间距计算器（不添加间距）
 */
const DEFAULT_SPACING: SpacingCalculator = {
  getPackingSize: (rect) => ({ ...rect }),
  getActualPosition: (x, y) => ({ x, y }),
};

/**
 * 排序矩形
 *
 * @param rectangles - 矩形列表
 * @returns {Rectangle[]} 排序后的矩形列表
 */
function sortRectangles(
  rectangles: Rectangle[],
): { rect: Rectangle; id: number }[] {
  return rectangles
    .map((rect) => ({ rect, id: rect.id }))
    .sort((a, b) => {
      const areaA = a.rect.width * a.rect.height;
      const areaB = b.rect.width * b.rect.height;
      return areaB - areaA;
    });
}

/**
 * 获取最优旋转
 *
 * @param rectangles - 矩形列表
 * @returns {boolean[]} 旋转数组
 */
function getOptimalRotations(rectangles: Rectangle[]): boolean[] {
  return rectangles.map((rect): boolean => rect.width < rect.height);
}

/**
 * 创建旋转数组
 *
 * @param length - 数组长度
 * @param value - 数组元素值
 * @returns {boolean[]} 旋转数组
 */
function createRotationArray(length: number, value: boolean): boolean[] {
  return Array.from({ length }).map(() => value);
}

/**
 * 智能打包
 *
 * @param rectangles - 矩形列表
 * @param options - 布局选项
 * @returns {LayoutResult} 布局结果
 */
function smartPacking(
  rectangles: Rectangle[],
  options: LayoutOptions = {},
): LayoutResult {
  const {
    maxIterations,
    allowRotation,
    spacing = DEFAULT_SPACING,
  } = { ...DEFAULT_OPTIONS, ...options };

  let bestArea = Number.MAX_VALUE;
  let bestFill = 0;
  let bestResult: LayoutResult = {
    width: 0,
    height: 0,
    layout: [],
  };

  const sortedRectangles = sortRectangles(rectangles);

  // 尝试不同的旋转组合
  for (let i = 0; i < maxIterations; i++) {
    let currentRotations: boolean[];

    if (!allowRotation) {
      // 一旦禁用旋转，不管是第几轮，都直接 false
      currentRotations = createRotationArray(rectangles.length, false);
    } else {
      // 允许旋转，才去根据 i 是否=0 来选择不同策略
      if (i === 0) {
        currentRotations = getOptimalRotations(
          sortedRectangles.map((item) => item.rect),
        );
      } else if (i === 1) {
        currentRotations = createRotationArray(rectangles.length, false);
      } else {
        currentRotations = rectangles.map(() => Math.random() < 0.5);
      }
    }

    // 准备打包的矩形（包含间距）
    const boxes: Box[] = sortedRectangles.map(({ rect, id }): Box => {
      const isRotated = Boolean(currentRotations[id]);
      const width = isRotated ? rect.height : rect.width;
      const height = isRotated ? rect.width : rect.height;

      const spacedSize = spacing.getPackingSize({ width, height, id });

      return {
        w: spacedSize.width,
        h: spacedSize.height,
        id,
        originalRect: rect,
        isRotated,
      };
    });

    const packResult = potpack(boxes);
    const area = packResult.w * packResult.h;
    const usedArea = boxes.reduce((sum, box) => sum + box.w * box.h, 0);
    const fill = usedArea / area;

    const quality =
      area * (1 + Math.abs(packResult.w / packResult.h - 1) * 0.1);

    if (
      quality < bestArea ||
      (Math.abs(quality - bestArea) < 100 && fill > bestFill)
    ) {
      bestArea = quality;
      bestFill = fill;

      const layout: PlacedRectangle[] = boxes.map((box) => {
        const width = box.isRotated
          ? box.originalRect.height
          : box.originalRect.width;
        const height = box.isRotated
          ? box.originalRect.width
          : box.originalRect.height;
        const actualPos = spacing.getActualPosition(box.x ?? 0, box.y ?? 0);

        const x = actualPos.x;
        const y = packResult.h - (actualPos.y + height);

        return {
          id: box.id,
          width,
          height,
          x,
          y,
        } satisfies PlacedRectangle;
      });

      // 按 id 排序
      layout.sort((a, b) => a.id - b.id);

      bestResult = {
        width: packResult.w,
        height: packResult.h,
        layout,
      };
    }
  }

  return bestResult;
}

/**
 * 计算最小面积布局
 * @param rectangles 输入的矩形列表
 * @param options 布局选项
 * @returns {LayoutResult} 布局结果, 返回的是左下角对齐的布局,符合笛卡尔坐标系的定义
 */
function calculateMinArea(
  rectangles: Rectangle[],
  options: LayoutOptions = {},
): LayoutResult {
  return smartPacking(rectangles, options);
}

export { calculateMinArea };
