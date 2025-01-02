import type { ForceOptions } from "../core";

interface ProductProps {
  quantity: number;
  cavityCount: number;
}

/**
 * 根据产品的数量和模具的穴数计算模次
 * @param {ProductProps} product 产品属性
 * @returns {number} 模次
 */
export function getSingleProductShots(product: ProductProps): number {
  if (product.quantity < 0) {
    throw new Error("产品数量不能小于0");
  }

  if (product.cavityCount <= 0) {
    throw new Error("模具穴数不能小于等于0");
  }

  if (product.quantity === 0) {
    return 0;
  }

  // 向上取整
  return Math.ceil(product.quantity / product.cavityCount);
}

export interface ProductShotsProps {
  materialName: string;
  quantity: number;
  cavityCount: number;
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
  if (products.length === 0) return 0;

  // 提前计算每个产品的模次
  const productsWithShots = products.map((p) => ({
    ...p,
    shots: getSingleProductShots(p),
  }));

  if (!forceOptions) {
    return productsWithShots.reduce((sum, p) => sum + p.shots, 0);
  }

  // 获取所有颜色和材料的唯一值
  const uniqueColors = new Set(productsWithShots.map((p) => p.color));
  const uniqueMaterials = new Set(productsWithShots.map((p) => p.materialName));

  // 判断颜色是否兼容
  const isColorCompatible =
    uniqueColors.size === 1 || forceOptions.isForceColorSimultaneous;

  // 判断材料是否兼容
  const isMaterialCompatible =
    uniqueMaterials.size === 1 || forceOptions.isForceMaterialSimultaneous;

  // 如果颜色和材料都兼容，返回最大模次
  if (isColorCompatible && isMaterialCompatible) {
    return Math.max(...productsWithShots.map((p) => p.shots));
  }

  // 如果颜色不兼容但材料兼容，按颜色分组计算模次
  if (!isColorCompatible && isMaterialCompatible) {
    const colorGroups = Array.from(uniqueColors).map((color) =>
      productsWithShots.filter((p) => p.color === color),
    );
    return colorGroups.reduce(
      (sum, group) => sum + Math.max(...group.map((p) => p.shots)),
      0,
    );
  }

  // 如果材料不兼容但颜色兼容，按材料分组计算模次
  if (isColorCompatible && !isMaterialCompatible) {
    const materialGroups = Array.from(uniqueMaterials).map((material) =>
      productsWithShots.filter((p) => p.materialName === material),
    );
    return materialGroups.reduce(
      (sum, group) => sum + Math.max(...group.map((p) => p.shots)),
      0,
    );
  }

  const combinedGroups = Array.from(uniqueColors).flatMap((color) =>
    Array.from(uniqueMaterials).map((material) =>
      productsWithShots.filter(
        (p) => p.color === color && p.materialName === material,
      ),
    ),
  );

  // 过滤掉空组，然后计算模次
  return combinedGroups
    .filter((group) => group.length > 0)
    .reduce((sum, group) => sum + Math.max(...group.map((p) => p.shots)), 0);
}
