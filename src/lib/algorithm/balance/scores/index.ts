import type { Rectangle, Point2D } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import type { BalanceScore } from "@/types/algorithm/balance/types";
import { calculateDetailedFlowScore } from "./flow";
import { calculateDistributionScore } from "./distribution";
import { geometryScorer } from "./geometry";
import { normalizeProducts } from "./geometry/utils/normalization";
/**
 * 计算总体平衡分数
 * @param layout 产品布局数组
 * @param products 产品信息数组
 * @param injectionPoint 注胶点位置
 * @returns 平衡评分结果
 */
export function calculateBalanceScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint: Point2D,
): BalanceScore {
  // 1. 处理空数据情况
  if (!layout.length || !products.length || layout.length !== products.length) {
    return {
      total: 0,
      details: {
        geometry: 0,
        flow: 0,
        distribution: 0,
      },
      confidence: 0,
    };
  }

  try {
    // 2. 计算各个维度的分数
    const normalizedProducts = normalizeProducts(products);
    const geometryScore = geometryScorer.calculateScore(normalizedProducts);
    const flowScore = calculateDetailedFlowScore(
      layout,
      products,
      injectionPoint,
    );
    const distributionScore = calculateDistributionScore(
      layout.reduce((acc, rect, i) => ({ ...acc, [i]: rect }), {}),
      products,
    );

    // 3. 定义权重
    const weights = {
      geometry: 0.3, // 几何特征权重
      flow: 0.4, // 流动平衡权重
      distribution: 0.3, // 分布均匀性权重
    };

    // 4. 计算加权总分
    const total = Math.min(
      100,
      weights.geometry * geometryScore.overall +
        weights.flow * flowScore.overall +
        weights.distribution * distributionScore.score,
    );

    // 5. 计算置信度（基于数据完整性）
    const confidence = calculateConfidence(products);

    // 6. 返回最终结果
    return {
      total,
      details: {
        geometry: geometryScore.overall,
        flow: flowScore.overall,
        distribution: distributionScore.score,
      },
      confidence,
    };
  } catch (error) {
    console.error("Error calculating balance score:", error);
    return {
      total: 0,
      details: {
        geometry: 0,
        flow: 0,
        distribution: 0,
      },
      confidence: 0,
    };
  }
}

/**
 * 计算评分置信度
 * @param products 产品数组
 * @returns 置信度 (0-1)
 */
function calculateConfidence(products: Product[]): number {
  // 检查关键数据的完整性
  const validDataPoints = products.filter(
    (product) =>
      product.cadData?.volume != null &&
      product.cadData?.surfaceArea != null &&
      product.dimensions?.length != null &&
      product.dimensions?.width != null &&
      product.dimensions?.height != null,
  ).length;

  return Math.min(1, validDataPoints / products.length);
}

// 导出所有子模块的评分函数
export * from "./geometry";
export * from "./flow";
export * from "./distribution";
