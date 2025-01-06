import { getProductsTotalShots } from "./shots";
import { getProductMaterial, getProductGrossProfit } from "../core";
import type { MachineConfig, ForceOptions } from "../core";
import { getTotalMachineProcessingFee } from "../machine";

interface ProductCostProps {
  materialName: string;
  color: string;
  quantity: number;
  cavityCount: number;
  netVolume: number;
}

interface ProductMaterialCosts {
  materialCost: number; // 材料成本
  wasteCost: number; // 损耗成本
  weight: number; // 产品重量
}

export interface ProductCostsResult {
  total: number;
  breakdown: {
    materialCost: number;
    wasteCost: number;
    processingFee: number;
    grossProfit: number;
  };
}

/**
 * 计算单个产品的材料相关成本
 * @param product 产品信息
 * @returns 包含材料成本、损耗成本和重量的对象
 */
function calculateProductMaterialCosts(
  product: ProductCostProps,
): ProductMaterialCosts {
  const material = getProductMaterial(product.materialName);
  const weight = product.netVolume * material.density * product.quantity;
  const materialCost = material.pricePerKg * weight;

  return {
    materialCost,
    wasteCost: materialCost * material.lossRate, // 损耗成本 = 材料成本 * 损耗率
    weight,
  };
}

/**
 * 计算所有产品的材料总成本
 * @param products 产品列表
 * @returns 所有产品的材料和损耗成本总和
 */
function calculateTotalMaterialCosts(products: ProductCostProps[]): {
  totalMaterialCost: number;
  totalWasteCost: number;
} {
  return products.reduce(
    (acc, product) => {
      const costs = calculateProductMaterialCosts(product);
      return {
        totalMaterialCost: acc.totalMaterialCost + costs.materialCost,
        totalWasteCost: acc.totalWasteCost + costs.wasteCost,
      };
    },
    { totalMaterialCost: 0, totalWasteCost: 0 },
  );
}

/**
 * 计算单个产品的毛利
 * @param product 产品信息
 * @param productProcessingFee 产品分摊的加工费
 * @returns 产品毛利
 */
function calculateSingleProductGrossProfit(
  product: ProductCostProps,
  productProcessingFee: number,
): number {
  const { materialCost, wasteCost } = calculateProductMaterialCosts(product);
  const totalCost = materialCost + wasteCost + productProcessingFee;
  const grossProfitRate = getProductGrossProfit(product.materialName);

  return totalCost * grossProfitRate;
}

/**
 * 计算所有产品的总毛利
 * @param products 产品列表
 * @param totalProcessingFee 总加工费
 * @returns 总毛利
 */
function calculateTotalGrossProfit(
  products: ProductCostProps[],
  totalProcessingFee: number,
): number {
  // 简单平均分配加工费到每个产品
  const processingFeePerProduct = totalProcessingFee / products.length;

  return products.reduce(
    (acc, product) =>
      acc + calculateSingleProductGrossProfit(product, processingFeePerProduct),
    0,
  );
}

/**
 * 计算产品的总价格
 * @param {ProductCostProps[]} products 产品列表
 * @param {MachineConfig} machineConfig 机器配置
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {ProductCostsResult} 产品的总价格（材料成本 + 损耗 + 加工费 + 毛利）
 */
export function calculateProductCosts(
  products: ProductCostProps[],
  machineConfig: MachineConfig,
  forceOptions?: ForceOptions,
): ProductCostsResult {
  // 1. 计算材料相关成本
  const { totalMaterialCost, totalWasteCost } =
    calculateTotalMaterialCosts(products);

  // 2. 计算加工费
  const totalShots = getProductsTotalShots(products, forceOptions);
  const totalProcessingFee = getTotalMachineProcessingFee(
    totalShots,
    machineConfig,
  );

  // 3. 计算毛利
  const totalGrossProfit = calculateTotalGrossProfit(
    products,
    totalProcessingFee,
  );

  // 4. 计算总费用
  const result = {
    total:
      totalMaterialCost +
      totalWasteCost +
      totalProcessingFee +
      totalGrossProfit,
    breakdown: {
      materialCost: totalMaterialCost,
      wasteCost: totalWasteCost,
      processingFee: totalProcessingFee,
      grossProfit: totalGrossProfit,
    },
  };

  // console.log("产品最终价格", result);

  return result;
}
