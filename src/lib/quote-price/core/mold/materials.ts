export const moldMaterialList = [
  {
    name: "NAK80",
    density: 0.00000785,
    pricePerKg: 10,
  },
  {
    name: "718H",
    density: 0.00000785,
    pricePerKg: 10,
  },
  {
    name: "P20",
    density: 0.00000785,
    pricePerKg: 10,
  },
  {
    name: "H13",
    density: 0.00000785,
    pricePerKg: 10,
  },
  {
    name: "S136",
    density: 0.00000785,
    pricePerKg: 10,
  },
];

/**
 * 模具材料类型
 * 以下type等同于：
 * type MoldMaterial = {
 *   name: string;
 *   density: number;
 *   pricePerKg: number;
 * }
 */
export type MoldMaterial = (typeof moldMaterialList)[number];

/**
 * 获取模具材料信息
 * @param {string} materialName 材料名称
 * @returns {MoldMaterial} 模具材料信息
 */
export function getMoldMaterial(materialName: string): MoldMaterial {
  const material = moldMaterialList.find(
    (material) => material.name === materialName,
  );
  if (!material) {
    throw new Error(`没有找到模具材料: ${materialName}`);
  }
  return material;
}
