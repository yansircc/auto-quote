import type { ProductMaterial } from "./types";
import { materialList } from "src/lib/constants/price-constant";

/**
 * 获取产品材料信息
 * @param {string} materialId 材料ID
 * @returns {ProductMaterial | null} 产品材料信息
 */
export function getProductMaterial(materialId: string): ProductMaterial | null {
  const material = materialList.find(
    (material) => material.name === materialId,
  );
  if (!material) {
    throw new Error(`没有找到产品材料: ${materialId}`);
  }
  return {
    id: material.name,
    name: material.name,
    density: material.density,
    pricePerKg: material.price,
  };
}

/**
 * 计算产品材料成本
 * @param {ProductMaterial} material 产品材料
 * @param {number} volume 产品体积（cm³）
 * @returns {number} 材料成本（元）
 */
export function calculateProductMaterialCost(
  material: ProductMaterial,
  volume: number,
): number {
  if (volume < 0) {
    throw new Error("产品体积不能为负数");
  }

  // 根据密度计算重量（g）
  const weight = volume * material.density;

  // 根据单价计算成本（元）
  return weight * material.pricePerKg;
}
