import type { Rectangle, Point2D, Product } from '@/lib/algorithm/types';
import type { BalanceScore } from './types';
import { calculateWeightedVariance, normalizeScore, weightedAverage } from './utils/math';
import { calculateDistance, calculateRectCenter, calculateInjectionPoint } from './utils/geometry';

/**
 * Calculate geometry balance score
 * 计算几何平衡分数
 */
function calculateGeometryScore(
  layout: Rectangle[],
  products: Product[]
): number {
  if (!layout.length || !products.length) return 0;

  // Calculate weighted center of mass
  // 计算加权质心
  const totalWeight = products.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  if (totalWeight === 0) return 0;

  const centerOfMass = {
    x:
      products.reduce((sum, p, i) => {
        const product = products[i];
        const rect = layout[i];
        if (!product || !rect) return sum;
        return sum + (product.weight ?? 0) * rect.x;
      }, 0) / totalWeight,
    y:
      products.reduce((sum, p, i) => {
        const product = products[i];
        const rect = layout[i];
        if (!product || !rect) return sum;
        return sum + (product.weight ?? 0) * rect.y;
      }, 0) / totalWeight,
  };

  // Calculate radial distribution from center of mass
  // 计算相对于质心的径向分布
  const radialDistances = layout.map((rect, i) => {
    const product = products[i];
    if (!product) return { distance: 0, weight: 0 };

    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;

    return {
      distance: Math.sqrt(dx * dx + dy * dy),
      weight: product.weight ?? 0,
    };
  });

  // Calculate weighted variance of distances
  // 计算距离的加权方差
  const distanceVariance = calculateWeightedVariance(
    radialDistances.map((d) => d.distance),
    radialDistances.map((d) => d.weight || 1)
  );

  // Calculate quadrant distribution
  // 计算象限分布
  const quadrants: [number, number, number, number] = [0, 0, 0, 0];
  layout.forEach((rect, i) => {
    const product = products[i];
    if (!product) return;

    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;
    const weight = product.weight ?? 1;

    if (dx >= 0 && dy >= 0) quadrants[0] += weight;
    else if (dx < 0 && dy >= 0) quadrants[1] += weight;
    else if (dx < 0 && dy < 0) quadrants[2] += weight;
    else quadrants[3] += weight;
  });

  // Calculate quadrant balance
  // 计算象限平衡度
  const quadrantVariance = calculateWeightedVariance(
    quadrants,
    quadrants.map(() => 1)
  );

  // Calculate center offset penalty
  // 计算中心偏移惩罚
  const maxDimension = Math.max(
    ...layout.map(r => Math.max(r.width, r.height))
  );
  const centerOffset = Math.sqrt(
    centerOfMass.x * centerOfMass.x + 
    centerOfMass.y * centerOfMass.y
  );
  const offsetPenalty = Math.min(100, (centerOffset / maxDimension) * 100);

  // Combine scores with weights
  // 综合加权得分
  return weightedAverage([
    [normalizeScore(distanceVariance, 2000), 0.4], // Radial balance
    [normalizeScore(quadrantVariance, 1000), 0.3], // Quadrant balance
    [normalizeScore(offsetPenalty, 100), 0.3],     // Center offset penalty
  ]);
}

/**
 * Calculate basic flow score
 * 计算基础流动分数
 */
function calculateBasicFlowScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint: Point2D
): number {
  const flowPaths = layout.map((rect, i) => {
    const center = calculateRectCenter(rect);
    const product = products[i];
    if (!product) return { length: 0, volume: 0, surfaceArea: 0 };

    return {
      length: calculateDistance(center, injectionPoint),
      volume: product.cadData?.volume ?? 0,
      surfaceArea: product.cadData?.surfaceArea ?? 0
    };
  });

  const resistances = flowPaths.map(path => ({
    value: path.length * (path.surfaceArea / Math.max(path.volume, 1)),
    weight: path.volume || 1
  }));

  return normalizeScore(
    calculateWeightedVariance(
      resistances.map(r => r.value),
      resistances.map(r => r.weight)
    )
  );
}

/**
 * Calculate distribution balance score
 * Considers weight distribution, volume distribution, and spatial arrangement
 * 计算分布平衡分数，考虑重量分布、体积分布和空间排布
 */
function calculateDistributionScore(
  layout: Rectangle[],
  products: Product[]
): number {
  // Weight distribution score
  // 重量分布得分
  const weightDistribution = layout.map((rect, i) => {
    const center = calculateRectCenter(rect);
    const product = products[i];
    if (!product) return { position: center, weight: 0, volume: 0 };
    
    return {
      position: center,
      weight: product.weight ?? 0,
      volume: product.cadData?.volume ?? 
        (product.dimensions ? 
          product.dimensions.length * 
          product.dimensions.width * 
          product.dimensions.height : 0)
    };
  });

  const weightScore = calculateSpatialDistributionScore(
    weightDistribution.map(w => w.position),
    weightDistribution.map(w => w.weight || 1) // Use 1 as default weight
  );

  // Volume distribution score
  // 体积分布得分
  const volumeDistribution = layout.map((rect, i) => {
    const center = calculateRectCenter(rect);
    const product = products[i];
    if (!product) return { position: center, volume: 0, rect };

    return {
      position: center,
      volume: product.cadData?.volume ?? (rect.width * rect.height), // Fallback to 2D area
      rect
    };
  });

  const volumeScore = calculateSpatialDistributionScore(
    volumeDistribution.map(v => v.position),
    volumeDistribution.map(v => v.volume || v.rect.width * v.rect.height) // Use area as fallback
  );

  // Combined score with weight distribution having higher priority
  // 综合得分，重量分布优先级更高
  return weightedAverage([
    [weightScore, 0.6],
    [volumeScore, 0.4]
  ]);
}

/**
 * Calculate spatial distribution score
 * 计算空间分布得分
 */
function calculateSpatialDistributionScore(
  positions: Point2D[],
  weights: number[]
): number {
  // Calculate weighted center
  // 计算加权中心
  const totalWeight = weights.reduce((sum, w) => sum + (w || 1), 0); // Use 1 as default weight
  const weightedCenter = {
    x: positions.reduce((sum, pos, i) => sum + pos.x * (weights[i] ?? 1), 0) / totalWeight,
    y: positions.reduce((sum, pos, i) => sum + pos.y * (weights[i] ?? 1), 0) / totalWeight
  };

  // Calculate weighted radial distribution
  // 计算加权径向分布
  const radialDistances = positions.map((pos, i) => ({
    distance: calculateDistance(pos, weightedCenter),
    weight: weights[i] ?? 1 // Use 1 as default weight
  }));

  // Calculate variance in radial distribution
  // 计算径向分布的方差
  const variance = calculateWeightedVariance(
    radialDistances.map(r => r.distance),
    radialDistances.map(r => r.weight)
  );

  return normalizeScore(variance);
}

/**
 * Calculate volume utilization score
 * Considers both overall utilization and balance
 * 计算体积利用分数，考虑整体利用率和平衡性
 */
function calculateVolumeScore(
  layout: Rectangle[],
  products: Product[]
): number {
  // Calculate bounding box of the layout
  // 计算布局的边界框
  const bounds = {
    minX: Math.min(...layout.map(r => r.x)),
    minY: Math.min(...layout.map(r => r.y)),
    maxX: Math.max(...layout.map(r => r.x + r.width)),
    maxY: Math.max(...layout.map(r => r.y + r.height))
  };

  const totalArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  const usedArea = layout.reduce((sum, rect) => 
    sum + (rect.width * rect.height), 0);

  // Area utilization score (2D)
  // 面积利用率得分（2D）
  const areaUtilization = usedArea / totalArea;
  const areaScore = normalizeScore(1 - areaUtilization); // 利用率越高越好

  // Volume balance score (considering product volumes)
  // 体积平衡得分（考虑产品体积）
  const volumes = products.map(p => 
    p.cadData?.volume ?? 
    (p.dimensions ? 
      p.dimensions.length * 
      p.dimensions.width * 
      p.dimensions.height : 0)
  );

  const volumeVariance = calculateWeightedVariance(
    volumes,
    volumes.map(() => 1)
  );

  const volumeScore = normalizeScore(volumeVariance);

  // Combine scores
  // 综合得分
  return weightedAverage([
    [areaScore, 0.6],     // Area utilization is more important
    [volumeScore, 0.4]    // Volume balance is secondary
  ]);
}

/**
 * Calculate confidence level based on available data
 * 基于可用数据计算置信度
 */
function calculateConfidence(products: Product[]): number {
  const hasCADData = products.filter(p => p.cadData).length;
  return hasCADData / products.length;
}

/**
 * Calculate overall balance score
 * 计算总体平衡分数
 */
export function calculateBalanceScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint?: Point2D
): BalanceScore {
  const actualInjectionPoint = injectionPoint ?? calculateInjectionPoint(layout);
  
  const geometryScore = calculateGeometryScore(layout, products);
  const flowScore = calculateBasicFlowScore(layout, products, actualInjectionPoint);
  const distributionScore = calculateDistributionScore(layout, products);
  const volumeScore = calculateVolumeScore(layout, products);
  
  // Calculate weight imbalance factor
  // 计算重量不平衡因子
  const totalWeight = products.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  const avgWeight = totalWeight / products.length;
  const maxWeightDiff = Math.max(
    ...products.map(p => Math.abs((p.weight ?? 0) - avgWeight))
  );
  const weightImbalanceFactor = maxWeightDiff / avgWeight;
  
  // Apply weight imbalance penalty
  // 应用重量不平衡惩罚
  const imbalancePenalty = Math.min(1, weightImbalanceFactor / 2); // 最多降低50%
  
  // Calculate base score
  // 计算基础分数
  const baseScore = weightedAverage([
    [geometryScore, 0.35],
    [flowScore, 0.15],
    [distributionScore, 0.35],
    [volumeScore, 0.15]
  ]);
  
  // Apply penalty
  // 应用惩罚
  const total = baseScore * (1 - imbalancePenalty);
  
  return {
    total,
    details: {
      geometry: geometryScore,
      flow: flowScore,
      distribution: distributionScore,
      volume: volumeScore
    },
    confidence: calculateConfidence(products)
  };
}
