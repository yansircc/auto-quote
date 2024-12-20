import { minSalesWeight, moldMaterialList } from "src/lib/constants/price-constant";
import type { MoldMaterial } from "./types";

/**
 * 获取模具材料信息
 * @param {string} materialId 材料ID
 * @returns {MoldMaterial | null} 模具材料信息
 */
export function getMoldMaterial(materialId: string): MoldMaterial | null {
  const material = moldMaterialList.find(material => material.name === materialId);
  if (!material) {
    throw new Error(`没有找到模具材料: ${materialId}`);
  }
  return {
    id: material.name,
    name: material.name,
    density: material.density,
    pricePerKg: material.price,
  };
}

/**
 * 计算模具材料成本
 * @param {MoldMaterial} material 模具材料
 * @param {number} volume 模具体积（cm³）
 * @returns {number} 材料成本（元）
 */
export function calculateMoldMaterialCost(
  material: MoldMaterial,
  moldVolume: number,
): number {
  // TODO:
  // 1. 根据体积和密度计算重量
  // 2. 根据重量和单价计算成本
  if (moldVolume < 0) {
    throw new Error('模具体积不能为负数');
  }

  const moldWeight = moldVolume * material.density;
  return Math.max(moldWeight, minSalesWeight) * material.pricePerKg;
}
