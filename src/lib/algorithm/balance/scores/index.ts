import type { Rectangle, Point2D, Product } from '@/types/geometry';
import type { BalanceScore } from '@/types/balance';
import { calculateDetailedGeometryScore } from './geometry';
import { calculateDetailedFlowScore } from './flow';
import { calculateDistributionScore } from './distribution';
import { calculateVolumeScore } from './volume';

/**
 * Calculate confidence level based on available data
 * 基于可用数据计算置信度
 */
function calculateConfidence(products: Product[]): number {
  const dataPoints = products.filter(p => 
    p.weight != null && 
    p.cadData?.volume != null && 
    p.cadData?.surfaceArea != null
  ).length;
  
  return Math.min(100, (dataPoints / products.length) * 100);
}

/**
 * Calculate overall balance score
 * 计算总体平衡分数
 */
function calculateBalanceScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint: Point2D
): BalanceScore {
  if (!layout.length || !products.length) {
    return {
      total: 0,
      details: {
        geometry: 0,
        flow: 0,
        distribution: 0,
        volume: 0
      },
      confidence: 0
    };
  }

  const geometryScore = calculateDetailedGeometryScore(layout, products);
  const flowScore = calculateDetailedFlowScore(layout, products, injectionPoint);
  const distribution = calculateDistributionScore(layout, products);
  const volume = calculateVolumeScore(layout, products);
  const confidence = calculateConfidence(products) / 100; // Convert to 0-1 range

  // Calculate overall score with dynamic weights
  const weights = {
    geometry: 0.3,
    flow: 0.4,
    distribution: 0.2,
    volume: 0.1
  };

  const total = Math.min(100,
    weights.geometry * geometryScore.overall +
    weights.flow * flowScore.overall +
    weights.distribution * distribution +
    weights.volume * volume
  );

  return {
    total,
    details: {
      geometry: geometryScore.overall,
      flow: flowScore.overall,
      distribution,
      volume
    },
    confidence
  };
}

// Re-export all score calculation functions
export * from './geometry';
export * from './flow';
export * from './distribution';
export * from './volume';

// Export main balance score calculation
export { calculateBalanceScore };
