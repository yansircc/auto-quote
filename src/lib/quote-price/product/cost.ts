import { getSingleProductShots, getProductsTotalShots } from "./shots";
import { getProductMaterial, getProductGrossProfit } from "../core";
import type { MachineConfig, ForceOptions } from "../core";
import { getTotalMachineProcessingFee } from "../machine";

interface ProductCostProps {
  materialName: string;
  shots: number;
  color: string;
  quantity: number;
  weight: number;
  cavityIndex: number;
}

/**
 * 计算产品的总价格
 * @param {ProductCostProps[]} products 产品列表
 * @param {MachineConfig} machineConfig 机器配置
 * @param {number[]} cavities 模具的穴数
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {number} 产品的总价格
 */
export function calculateProductCosts(
  products: ProductCostProps[],
  machineConfig: MachineConfig,
  cavities: number[],
  forceOptions?: ForceOptions,
): number {
  // 计算产品的材料总成本和损耗总费用
  const { materialCost, wasteCost } = products.reduce(
    (acc, product) => {
      const material = getProductMaterial(product.materialName);
      const productWeight = product.weight * product.quantity;

      return {
        materialCost: acc.materialCost + material.pricePerKg * productWeight,
        wasteCost: acc.wasteCost + material.lossRate * productWeight,
      };
    },
    { materialCost: 0, wasteCost: 0 },
  );

  // 计算产品各自的模次
  const cavityIndex = products.map((product) => product.cavityIndex);
  if (cavityIndex.length !== products.length) {
    throw new Error("模具的穴数和产品数量不匹配");
  }

  const productProperties = products.map((product) => {
    const cavity = cavities[product.cavityIndex];
    if (typeof cavity !== "number") {
      throw new Error(`无效的模具穴数索引: ${product.cavityIndex}`);
    }
    return {
      shots: getSingleProductShots(product.quantity, cavity),
      materialName: product.materialName,
      color: product.color,
    };
  });

  // 计算需要的总模次
  const totalShots = getProductsTotalShots(productProperties, forceOptions);

  // 计算产品的总加工费
  const totalMachineProcessingFee = getTotalMachineProcessingFee(
    totalShots,
    machineConfig,
  );

  // 计算产品的总毛利
  const totalGrossProfit = products.reduce((acc, product) => {
    const grossProfit = getProductGrossProfit(product.materialName);
    return acc + grossProfit;
  }, 0);

  // 计算产品的总费用
  return (
    materialCost + wasteCost + totalMachineProcessingFee + totalGrossProfit
  );
}
