import { checkGroupCompatibility } from "./compatibility";
import { generateSetPartitions, filterPartitions } from "./utils";
import type { ForceOptions } from "../core";

interface ProductProps {
  materialName: string;
  color: string;
  id?: number;
}

/**
 * 生成所有符合条件的集合划分
 * @param {ProductProps[]} products 产品列表
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {ProductProps[][][]} 所有符合条件的集合划分
 */
export function generateGrouping(
  products: ProductProps[],
  forceOptions?: ForceOptions,
): ProductProps[][][] {
  // 生成所有可能的分组方案
  const allPartitions = generateSetPartitions(products);

  // 筛选出符合兼容性要求的分组方案
  const validPartitions = filterPartitions(allPartitions, (partition) => {
    // 检查每个分组是否都满足兼容性要求
    return partition.every((group) =>
      checkGroupCompatibility(group, forceOptions),
    );
  });

  return validPartitions;
}
