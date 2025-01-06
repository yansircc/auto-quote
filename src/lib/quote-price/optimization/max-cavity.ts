import { getProductMaterial } from "@/lib/quote-price/core";
import { DEFAULT_SPACING } from "@/lib/quote-price/mold";
import type { Dimensions } from "@/lib/quote-price/core";

// 定义安全边距和安全高度，临时
const SAFETY_WIDTH = 145;
const SAFETY_DEPTH = 145;
const SAFETY_HEIGHT = 510;

const DEFAULT_MOLD_MAX_DIMENSIONS: Dimensions = {
  width: 1145,
  depth: 1145,
  height: 720,
};

const DEFAULT_MACHINE_MAX_INJECTION_WEIGHT = 7339;

export interface ProductProps {
  id: number;
  materialName: string;
  netVolume: number;
  dimensions: Dimensions;
}

/**
 * 计算每个产品在模具中的最大可能的穴数
 * @param {ProductProps[]} products 待处理产品
 * @param {MaxDimensions} maxDimensions 模具的极限尺寸
 * @param {number} maxInjectionWeight 模具的最大承重
 * @returns {Record<string, number>} 每个产品在模具中的最大可能的穴数
 */
export function getAllMaxCavityCount(
  products: ProductProps[],
  maxDimensions: Dimensions = DEFAULT_MOLD_MAX_DIMENSIONS,
  maxInjectionWeight: number = DEFAULT_MACHINE_MAX_INJECTION_WEIGHT,
): Record<string, number> {
  if (products.length === 0) {
    return {};
  }

  const availableWidth = maxDimensions.width - SAFETY_WIDTH * 2;
  const availableDepth = maxDimensions.depth - SAFETY_DEPTH * 2;
  const availableHeight = maxDimensions.height - SAFETY_HEIGHT;

  // 扁平化产品数值后找到xy平面的最长边
  const maxProductSide = Math.max(
    ...products.map((product) =>
      Math.max(product.dimensions.width, product.dimensions.depth),
    ),
  );

  if (maxProductSide > availableWidth || maxProductSide > availableDepth) {
    throw new Error(
      `产品最大边 ${maxProductSide} 超出模具宽度 ${availableWidth} 或深度 ${availableDepth}`,
    );
  }

  const maxProductHeight = Math.max(
    ...products.map((product) => product.dimensions.height),
  );

  if (maxProductHeight > availableHeight) {
    throw new Error(
      `产品最大高度 ${maxProductHeight} 超出模具高度 ${availableHeight}`,
    );
  }

  // 计算总重量和总面积的初始值（每个产品至少一个穴）
  let totalWeight = 0;
  let totalArea = 0;

  // 预计算每个产品的基本信息
  const productInfo = products.map((product) => {
    const material = getProductMaterial(product.materialName);
    const weight = product.netVolume * material.density;
    const area =
      (product.dimensions.width + DEFAULT_SPACING) *
      (product.dimensions.depth + DEFAULT_SPACING);

    totalWeight += weight;
    totalArea += area;

    return {
      id: product.id,
      weight,
      area,
      height: product.dimensions.height + SAFETY_HEIGHT,
    };
  });

  // 检查高度限制
  const maxHeight = maxDimensions.height;
  if (productInfo.some((p) => p.height > maxHeight)) {
    throw new Error("产品高度超过模具极限");
  }
  // 计算每个产品的最大穴数
  const maxCavityCounts: Record<string, number> = {};

  productInfo.forEach((product) => {
    // 基于面积的限制
    const areaLimit = Math.floor(
      (availableWidth * availableDepth - totalArea + product.area) /
        product.area,
    );

    // 基于重量的限制
    const weightLimit = Math.floor(
      (maxInjectionWeight - totalWeight + product.weight) / product.weight,
    );

    // 取两者中的较小值
    maxCavityCounts[product.id] = Math.max(1, Math.min(areaLimit, weightLimit));
  });

  return maxCavityCounts;
}
