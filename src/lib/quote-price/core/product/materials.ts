export const materialList = [
  {
    name: "ABS",
    density: 0.0012,
    pricePerKg: 0.013,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "ASA",
    density: 0.0012,
    pricePerKg: 0.02,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "GPPS",
    density: 0.0012,
    pricePerKg: 0.015,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "HDPE",
    density: 0.001,
    pricePerKg: 0.011,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "HIPS",
    density: 0.0012,
    pricePerKg: 0.012,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "LDPE",
    density: 0.001,
    pricePerKg: 0.011,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PA6",
    density: 0.0012,
    pricePerKg: 0.017,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PA66",
    density: 0.0012,
    pricePerKg: 0.022,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PA66-GF",
    density: 0.0014,
    pricePerKg: 0.021,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PA6-GF",
    density: 0.0014,
    pricePerKg: 0.016,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PBT",
    density: 0.00135,
    pricePerKg: 0.02,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PBT+GF",
    density: 0.00155,
    pricePerKg: 0.018,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PC",
    density: 0.0012,
    pricePerKg: 0.023,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PC+ABS",
    density: 0.0012,
    pricePerKg: 0.025,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PC+ASA",
    density: 0.0012,
    pricePerKg: 0.024,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PC+PBT",
    density: 0.00125,
    pricePerKg: 0.03,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PCTG",
    density: 0.0012,
    pricePerKg: 0.03,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PET",
    density: 0.0014,
    pricePerKg: 0.016,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PLA",
    density: 0.0013,
    pricePerKg: 0.04,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PMMA",
    density: 0.0012,
    pricePerKg: 0.023,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "POM",
    density: 0.00145,
    pricePerKg: 0.02,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PP",
    density: 0.001,
    pricePerKg: 0.011,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PP-EPDM",
    density: 0.0011,
    pricePerKg: 0.022,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PP-GF",
    density: 0.00125,
    pricePerKg: 0.012,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PPO",
    density: 0.0011,
    pricePerKg: 0.03,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PPS",
    density: 0.0014,
    pricePerKg: 0.072,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PPSU",
    density: 0.0013,
    pricePerKg: 0.19,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PP-TD",
    density: 0.001,
    pricePerKg: 0.018,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "PVC",
    density: 0.0014,
    pricePerKg: 0.018,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "SAN",
    density: 0.0011,
    pricePerKg: 0.019,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "TPE",
    density: 0.0012,
    pricePerKg: 0.025,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "TPU",
    density: 0.0012,
    pricePerKg: 0.03,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
  {
    name: "TPV",
    density: 0.0011,
    pricePerKg: 0.024,
    lossRate: 0.1,
    grossProfit: 0.5,
  },
];

/**
 * 产品材料
 * 以下type等同于：
 * type ProductMaterial = {
 *   name: string;
 *   density: number;
 *   pricePerKg: number;
 * }
 */
export type ProductMaterial = (typeof materialList)[number];

/**
 * 获取产品材料信息
 * @param {string} materialName 材料名称
 * @returns {ProductMaterial} 产品材料信息
 */
export function getProductMaterial(materialName: string): ProductMaterial {
  const material = materialList.find(
    (material) => material.name === materialName,
  );
  if (!material) {
    throw new Error(`没有找到产品材料: ${materialName}`);
  }
  return material;
}
