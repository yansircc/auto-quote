import { getProductMaterial } from "./materials";

/**
 * 获取产品毛利
 * @param { string } materialName 材料名称
 * @returns {number} 产品毛利
 */
export function getProductGrossProfit(materialName: string): number {
  const material = getProductMaterial(materialName);
  return material.grossProfit;
}
