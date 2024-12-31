/**
 * @description 产品分组兼容性检查工具
 *
 * 本文件包含用于检查产品分组兼容性的函数，主要用于：
 * 1. 检查两个产品是否可以组合
 * 2. 检查一组产品是否可以组合
 * 3. 支持根据分组配置（如材料、颜色等）进行兼容性验证
 *
 * 依赖：
 * - Product 类型：定义产品的基本属性
 * - GroupingConfig 类型：定义分组配置规则
 *
 * 主要函数：
 * 1. checkProductCompatibility: 检查两个产品是否兼容
 * 2. checkGroupCompatibility: 检查一组产品是否兼容
 *
 * 注意事项：
 * - 兼容性检查基于分组配置中的规则（如是否允许不同材料、颜色等）
 * - 时间复杂度优化：checkGroupCompatibility 从 O(n²) 降低到 O(n)
 */

<<<<<<< HEAD
import type { Product } from "../../product/types";
=======
import type { SimplifiedProductProps } from "../../core";
>>>>>>> upstream/main
import type { GroupingConfig } from "../types";

/**
 * 检查两个产品是否可以组合
 * @param {Product} product1 产品1
 * @param {Product} product2 产品2
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可以组合
 */
<<<<<<< HEAD
function checkProductCompatibility(
  product1: Product,
  product2: Product,
=======
export function checkProductCompatibility(
  product1: SimplifiedProductProps,
  product2: SimplifiedProductProps,
>>>>>>> upstream/main
  config: GroupingConfig,
): boolean {
  // TODO:
  // 1. 检查材料兼容性
  //    - 如果材料不同且未启用 allowDifferentMaterials，返回 false
  if (
<<<<<<< HEAD
    product1.material !== product2.material &&
=======
    product1.materialName !== product2.materialName &&
>>>>>>> upstream/main
    !config.forceGrouping.allowDifferentMaterials
  ) {
    return false;
  }

  // 2. 检查颜色兼容性
  if (
    product1.color !== product2.color &&
    !config.forceGrouping.allowDifferentColors
  ) {
    return false;
  }

  return true;
}

/**
 * 检查一组产品是否可以组合，需要将时间复杂度从 O(n²) 降低到 O(n)
 * @param {Product[]} products 产品列表
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可以组合
 */
export function checkGroupCompatibility(
  products: SimplifiedProductProps[],
  config: GroupingConfig,
): boolean {
  if (products.length === 0) throw new Error("产品列表不能为空");
  if (products.length === 1) return true;

  // 获取第一个产品作为基准
  const baseProduct = products[0];
  if (!baseProduct) throw new Error("产品列表中存在空产品");

  // 检查所有产品是否与基准产品兼容
  for (let i = 1; i < products.length; i++) {
    const currentProduct = products[i];
    if (!currentProduct) throw new Error("产品列表中存在空产品");

    if (!checkProductCompatibility(baseProduct, currentProduct, config)) {
      return false;
    }
  }

  return true;
}
