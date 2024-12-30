const safeEdgeThicknessList = [
  { maxLength: 150, thickness: 60 },
  { maxLength: 200, thickness: 65 },
  { maxLength: 250, thickness: 70 },
  { maxLength: 300, thickness: 75 },
  { maxLength: 350, thickness: 80 },
  { maxLength: 400, thickness: 85 },
  { maxLength: 450, thickness: 90 },
  { maxLength: 500, thickness: 95 },
  { maxLength: 550, thickness: 100 },
  { maxLength: 600, thickness: 105 },
  { maxLength: 650, thickness: 110 },
  { maxLength: 700, thickness: 115 },
  { maxLength: 750, thickness: 120 },
  { maxLength: 800, thickness: 125 },
  { maxLength: 850, thickness: 130 },
  { maxLength: 900, thickness: 135 },
  { maxLength: 950, thickness: 140 },
  { maxLength: 1000, thickness: 145 },
];

const safeBottomThicknessList = [
  { maxHeight: 50, thickness: 210 },
  { maxHeight: 60, thickness: 230 },
  { maxHeight: 70, thickness: 250 },
  { maxHeight: 80, thickness: 270 },
  { maxHeight: 90, thickness: 290 },
  { maxHeight: 100, thickness: 310 },
  { maxHeight: 110, thickness: 330 },
  { maxHeight: 120, thickness: 350 },
  { maxHeight: 140, thickness: 370 },
  { maxHeight: 150, thickness: 390 },
  { maxHeight: 160, thickness: 410 },
  { maxHeight: 170, thickness: 430 },
  { maxHeight: 180, thickness: 450 },
  { maxHeight: 190, thickness: 470 },
  { maxHeight: 200, thickness: 490 },
  { maxHeight: 210, thickness: 510 },
];

/**
 * 获取模具的边框厚度
 * @param {number} width 模具宽度
 * @returns {number} 模具的边框厚度
 */
export function getSafeEdgeThickness(width: number): number {
  if (width <= 0) {
    throw new Error("模具宽度不能小于等于0");
  }

  // 过滤出所有适用的厚度，然后取最小值
  const applicableThicknesses = safeEdgeThicknessList
    .filter((item) => item.maxLength >= width)
    .map((item) => item.thickness);

  if (applicableThicknesses.length === 0) {
    throw new Error("模具宽度超出安全厚度范围");
  }

  return Math.min(...applicableThicknesses);
}

/**
 * 获取模具的底部厚度
 * @param {number} height 模具高度
 * @returns {number} 模具的底部厚度
 */
export function getSafeBottomThickness(height: number): number {
  if (height <= 0) {
    throw new Error("模具高度不能小于等于0");
  }

  const applicableThicknesses = safeBottomThicknessList
    .filter((item) => item.maxHeight >= height)
    .map((item) => item.thickness);

  if (applicableThicknesses.length === 0) {
    throw new Error("模具高度超出安全厚度范围");
  }

  return Math.min(...applicableThicknesses);
}
