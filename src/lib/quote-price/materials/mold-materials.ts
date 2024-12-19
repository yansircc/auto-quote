import type { MoldMaterial } from "./types";

/**
 * 获取模具材料信息
 * @param {string} materialId 材料ID
 * @returns {MoldMaterial | null} 模具材料信息
 */
export function getMoldMaterial(materialId: string): MoldMaterial | null {
  // 伪代码：从数据库或配置中获取模具材料信息
  return null;
}

/**
 * 计算模具材料成本
 * @param {MoldMaterial} material 模具材料
 * @param {number} volume 模具体积（cm³）
 * @returns {number} 材料成本（元）
 */
export function calculateMoldMaterialCost(
  material: MoldMaterial,
  volume: number,
): number {
  // TODO:
  // 1. 根据体积和密度计算重量
  // 2. 根据重量和单价计算成本
  return 0;
}
