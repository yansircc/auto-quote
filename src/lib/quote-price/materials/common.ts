import { moldMaterialList, materialList } from "src/lib/constants/price-constant";

/**
 * 根据模具材料名称获取材料信息
 * @param {string} materialName 材料名称
 * @returns {(typeof moldMaterialList)[number]} 材料信息
 */
export function getMoldMaterialByName(materialName: string) {
  if (!materialName) {
    throw new Error('模具材料名称不能为空');
  }

  const material = moldMaterialList.find(material => 
    material.name === materialName
  );

  if (!material) {
    throw new Error('没有找到对应的模具材料');
  }

  return material;
}

/**
 * 根据模具材料名称获取材料密度
 * @param {string} materialName 材料名称
 * @returns {number} 材料密度
 */
export function getMoldMaterialDensityByName(materialName: string): number {
  const material = getMoldMaterialByName(materialName);
  return material.density;
}

/**
 * 根据模具材料名称获取材料单价
 * @param {string} materialName 材料名称
 * @returns {number} 材料单价
 */
export function getMoldMaterialPriceByName(materialName: string): number {
  const material = getMoldMaterialByName(materialName);
  return material.price;
}

/**
 * 根据产品材料名称获取材料信息
 * @param {string} materialName 材料名称
 * @returns {(typeof materialList)[number]} 材料信息
 */
export function getProductMaterialByName(materialName: string) {
  if (!materialName) {
    throw new Error('产品材料名称不能为空');
  }

  const material = materialList.find(material => 
    material.name === materialName
  );

  if (!material) {
    throw new Error('没有找到对应的产品材料');
  }

  return material;
}

/**
 * 根据产品材料名称获取材料密度
 * @param {string} materialName 材料名称
 * @returns {number} 材料密度 (g/cm³)
 */
export function getProductMaterialDensityByName(materialName: string): number {
  const material = getProductMaterialByName(materialName);
  return material.density;
}

/**
 * 根据产品材料名称获取材料单价
 * @param {string} materialName 材料名称
 * @returns {number} 材料单价 (元/g)
 */
export function getProductMaterialPriceByName(materialName: string): number {
  const material = getProductMaterialByName(materialName);
  return material.price;
}

