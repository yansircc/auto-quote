import type { ForceOptions } from "../core";

interface ProductProps {
  materialName: string;
  color: string;
}

/**
 * 检查一组产品是否可以组合
 * @param {ProductProps[]} products 产品列表
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {boolean} 是否可以组合
 */
export function checkGroupCompatibility(
  products: ProductProps[],
  forceOptions?: ForceOptions,
): boolean {
  if (products.length === 0) throw new Error("产品列表不能为空");
  if (products.length === 1) return true;

  // 获取所有颜色和材料的唯一值
  const uniqueColors = new Set(products.map((p) => p.color));
  const uniqueMaterials = new Set(products.map((p) => p.materialName));

  // 判断颜色是否兼容
  const isColorCompatible =
    uniqueColors.size === 1 || forceOptions?.isForceColorSimultaneous;

  // 判断材料是否兼容
  const isMaterialCompatible =
    uniqueMaterials.size === 1 || forceOptions?.isForceMaterialSimultaneous;

  // 如果颜色或材料不兼容，直接返回 false
  if (!isColorCompatible || !isMaterialCompatible) {
    return false;
  }

  // 如果颜色和材料都兼容，则可以组合
  return true;
}
