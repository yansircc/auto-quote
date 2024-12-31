import type { ForceOptions } from "../core";

/**
 * 根据产品的数量和模具的穴数计算模次
 * @param {number} quantity 产品的数量
 * @param {number} cavities 模具的穴数
 * @returns {number} 模次
 */
export function getSingleProductShots(
  quantity: number,
  cavities: number,
): number {
  if (quantity < 0) {
    throw new Error("产品数量不能小于0");
  }

  if (cavities <= 0) {
    throw new Error("模具穴数不能小于等于0");
  }

  if (quantity === 0) {
    return 0;
  }

  // 向上取整
  return Math.ceil(quantity / cavities);
}

interface ProductShotsProps {
  materialName: string;
  shots: number;
  color: string;
}

/**
 * 计算一组产品的总模次
 * @param {ProductShotsProps[]} products 产品属性
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {number} 总模次
 */
export function getProductsTotalShots(
  products: ProductShotsProps[],
  forceOptions?: ForceOptions,
): number {
  // 如果产品列表为空，返回0
  if (products.length === 0) return 0;

  // 如果强制选项为空，则不强制
  if (!forceOptions) {
    return products.reduce((sum, product) => sum + product.shots, 0);
  }

  // 获取所有颜色和材料的唯一值
  const uniqueColors = new Set(products.map((p) => p.color));
  const uniqueMaterials = new Set(products.map((p) => p.materialName));

  // 判断颜色是否兼容
  const isColorCompatible =
    uniqueColors.size === 1 || forceOptions.isForceColorSimultaneous;

  // 判断材料是否兼容
  const isMaterialCompatible =
    uniqueMaterials.size === 1 || forceOptions.isForceMaterialSimultaneous;

  // 如果颜色和材料都兼容，返回最大模次
  if (isColorCompatible && isMaterialCompatible) {
    return Math.max(...products.map((p) => p.shots));
  }

  // 如果颜色不兼容但材料兼容，按颜色分组计算模次
  if (!isColorCompatible && isMaterialCompatible) {
    const colorGroups = Array.from(uniqueColors).map((color) =>
      products.filter((p) => p.color === color),
    );
    return colorGroups.reduce(
      (sum, group) => sum + Math.max(...group.map((p) => p.shots)),
      0,
    );
  }

  // 如果材料不兼容但颜色兼容，按材料分组计算模次
  if (isColorCompatible && !isMaterialCompatible) {
    const materialGroups = Array.from(uniqueMaterials).map((material) =>
      products.filter((p) => p.materialName === material),
    );
    return materialGroups.reduce(
      (sum, group) => sum + Math.max(...group.map((p) => p.shots)),
      0,
    );
  }

  // 如果颜色和材料都不兼容，按颜色和材料组合分组计算模次
  const combinedGroups = Array.from(uniqueColors).flatMap((color) =>
    Array.from(uniqueMaterials).map((material) =>
      products.filter((p) => p.color === color && p.materialName === material),
    ),
  );

  // 过滤掉空组，然后计算模次
  return combinedGroups
    .filter((group) => group.length > 0) // 过滤空组
    .reduce((sum, group) => sum + Math.max(...group.map((p) => p.shots)), 0);
}
