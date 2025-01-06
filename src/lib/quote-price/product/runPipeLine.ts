import type { Product } from "./types";
import type { MoldDimensions, ProductPrice } from "./product-schema";

import { type Mold } from "../mold/types";
import { runAllScorers } from "../mold/layout";
import { getMoldMaterial, type MoldMaterial } from "../materials";
import {
  calculateGrossProfit,
  calculateMaintenanceFee,
  calculateMoldMaterialCost,
  calculateProcessingFee,
} from "../mold/cost";
import { getHeightByMaxProductHeight, getMarginByWidth } from "../mold/common";
import { calculateCavityLayout } from "../mold/layout/cavity-layout";
import { getMoldMaterialDensity, productToMold } from "./common";

interface MoldPrice {
  moldMaterialCost: number;
  maintenanceFee: number;
  processingFee: number;
  moldProfit: number;
  totalPrice: number;
}

/**
 * 计算模具报价
 * @param mold 模具信息
 * @returns 包含各项成本和总报价的 MoldPrice 对象
 */
export function calculateMoldPrice(mold: Mold): MoldPrice {
  // 计算模具材料成本
  const moldMaterialCost = calculateMoldMaterialCost(mold);
  // 计算模具维护费用
  const maintenanceFee = calculateMaintenanceFee(mold.weight, null);
  // 计算模具加工费用
  const processingFee = calculateProcessingFee(mold, null);
  // 计算模具利润
  const moldProfit = calculateGrossProfit(mold.weight, null);
  // 计算模具总报价
  const totalPrice =
    moldMaterialCost + maintenanceFee + processingFee + moldProfit;

  return {
    moldMaterialCost,
    maintenanceFee,
    processingFee,
    moldProfit,
    totalPrice,
  };
}

/**
 * 运行模具厂报价流水线
 * @param products 产品信息
 * @param moldMaterial 模具材料，默认使用P20
 * @returns 包含最小面积、模具价格和产品价格以及评分的结果
 */
export function runProductPricePipeline(
  products: Product[],
  moldMaterial: MoldMaterial = getMoldMaterial("P20")!,
): MoldDimensions {
  if (!products || products.length === 0) {
    throw new Error("产品列表不能为空");
  }

  console.log("layoutResult before calculateMinArea");

  // 1. 计算最小面积
  // 这里计算出来的layoutResult会发生变化？
  const layoutResult = calculateCavityLayout(
    products.map((product) => ({
      width: product.dimensions.width,
      height: product.dimensions.height,
    })),
  );

  console.log("layoutResult after calculateMinArea", layoutResult);

  //2、计算模具高度
  const maxProductHeight = getHeightByMaxProductHeight(
    Math.max(...products.map((product) => product.dimensions.height)),
  );

  //3、计算模具边距
  const moldMargin = Math.max(
    getMarginByWidth(layoutResult.width),
    getMarginByWidth(layoutResult.height),
  );

  //4、计算模具重量
  const moldWeight =
    getMoldMaterialDensity() *
    layoutResult.width *
    layoutResult.height *
    maxProductHeight;

  console.log("moldWeight", moldWeight);

  //5、 计算平衡布局的分数
  const { weightedAverage, ...scores } = runAllScorers(
    productToMold(products),
    true,
  );

  console.log("scores", scores);
  console.log("weightedAverage", weightedAverage);

  //6、构建模具
  const mold: Mold = {
    scores,
    weightedAverage,
    material: {
      id: moldMaterial.id,
      name: moldMaterial.name,
      density: moldMaterial.density,
      pricePerKg: moldMaterial.pricePerKg,
    },
    dimensions: {
      width: layoutResult.width + moldMargin * 2,
      height: maxProductHeight,
      depth: layoutResult.height + moldMargin * 2,
    },
    weight: moldWeight,
    cavityCount: products.length,
  };

  const { totalPrice: moldPrice } = calculateMoldPrice(mold);

  return {
    scores: mold.scores,
    weightedAverage: mold.weightedAverage,
    width: mold.dimensions.width,
    depth: mold.dimensions.height,
    height: mold.dimensions.depth,
    moldMaterial: mold.material.name,
    moldWeight: Number(mold.weight.toFixed(3)),
    moldPrice: Number(moldPrice.toFixed(3)),
    maxInnerLength: layoutResult.width,
    maxInnerWidth: layoutResult.height,
    verticalMargin: moldMargin,
    horizontalMargin: moldMargin,
  };
}
