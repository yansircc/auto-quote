import type { Rectangle, Point2D, Product } from '@/types/geometry';
import type { BalanceScore, DetailedGeometryScore, DetailedFlowScore } from '@/types/balance';
import { calculateWeightedVariance, normalizeScore, weightedAverage } from './utils/math';
import { calculateDistance, calculateRectCenter } from './utils/geometry';

/**
 * Calculate geometry balance score
 * 计算几何平衡分数
 */
function calculateGeometryScore(
  layout: Rectangle[],
  products: Product[]
): number {
  const detailedScore = calculateDetailedGeometryScore(layout, products);
  return detailedScore.overall;
}

/**
 * Calculate detailed geometry balance score
 * 计算详细的几何平衡分数
 */
function calculateDetailedGeometryScore(
  layout: Rectangle[],
  products: Product[]
): DetailedGeometryScore {
  if (!layout.length || !products.length) {
    return {
      radialBalance: 0,
      quadrantBalance: 0,
      centerOffset: 0,
      overall: 0
    };
  }

  // Calculate weighted center of mass
  // 计算加权质心
  const totalWeight = products.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  if (totalWeight === 0) {
    return {
      radialBalance: 0,
      quadrantBalance: 0,
      centerOffset: 0,
      overall: 0
    };
  }

  const centerOfMass = {
    x: products.reduce((sum, p, _products) => {
      const product = products[_products];
      const rect = layout[_products];
      if (!product || !rect) return sum;
      return sum + ((product.weight ?? 0) * rect.x);
    }, 0) / totalWeight,
    y: products.reduce((sum, p, _products) => {
      const product = products[_products];
      const rect = layout[_products];
      if (!product || !rect) return sum;
      return sum + ((product.weight ?? 0) * rect.y);
    }, 0) / totalWeight,
  };

  // Calculate radial balance
  // 计算径向平衡性
  const radialDistances = layout.map((rect, i) => {
    const product = products[i];
    if (!product || !rect) {
      throw new Error(`Invalid product or layout data at index ${i}`);
    }
    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;
    return {
      distance: Math.sqrt(dx * dx + dy * dy),
      weight: product.weight ?? 0,
    };
  });

  // 归一化方差，确保分数在0-100之间
  const variance = calculateWeightedVariance(
    radialDistances.map(d => d.distance),
    radialDistances.map(d => d.weight)
  );
  const maxDistance = Math.max(...radialDistances.map(d => d.distance));
  const normalizedVariance = variance / (maxDistance * maxDistance); // 归一化到0-1范围
  const radialBalance = Math.max(0, Math.min(100, 100 * (1 - normalizedVariance)));

  // Calculate quadrant balance
  // 计算象限平衡性
  const quadrants = [0, 0, 0, 0];
  layout.forEach((rect, i) => {
    const product = products[i];
    if (!product || !rect) {
      throw new Error(`Invalid product or layout data at index ${i}`);
    }
    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;
    const quadrant = (dx >= 0 ? (dy >= 0 ? 0 : 3) : (dy >= 0 ? 1 : 2));
    quadrants[quadrant]! += product.weight ?? 0;
  });

  // 使用相对差异计算象限平衡分数
  const maxQuadrant = Math.max(...quadrants);
  const minQuadrant = Math.min(...quadrants);
  const avgQuadrant = totalWeight / 4;
  const maxDeviation = Math.max(
    Math.abs(maxQuadrant - avgQuadrant),
    Math.abs(minQuadrant - avgQuadrant)
  );
  const quadrantBalance = Math.max(0, Math.min(100, 100 * (1 - maxDeviation / avgQuadrant)));

  // Calculate center offset
  // 计算中心偏移
  const centerDistance = Math.sqrt(centerOfMass.x * centerOfMass.x + centerOfMass.y * centerOfMass.y);
  const centerOffset = maxDistance === 0 ? 100 : 
    Math.max(0, Math.min(100, 100 * (1 - centerDistance / maxDistance)));

  // Calculate overall score as weighted average
  // 使用加权平均计算总体得分
  const overall = weightedAverage([
    [radialBalance, 0.4],     // 径向平衡权重 40%
    [quadrantBalance, 0.4],   // 象限平衡权重 40%
    [centerOffset, 0.2]       // 中心偏移权重 20%
  ]);

  return {
    radialBalance,
    quadrantBalance,
    centerOffset,
    overall
  };
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
  const detailedScore = calculateDetailedFlowScore(layout, products, injectionPoint);
  return detailedScore.overall;
}

/**
 * Calculate detailed flow balance score
 * 计算详细的流动平衡分数
 */
function calculateDetailedFlowScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint: Point2D
): DetailedFlowScore {
  if (!layout.length || !products.length) {
    return {
      flowPathBalance: 0,
      surfaceAreaBalance: 0,
      volumeBalance: 0,
      overall: 0
    };
  }

  const flowPaths = products.map((product, i) => {
    if (product.flowLength != null) {
      return product.flowLength;
    }
    const center = calculateRectCenter(layout[i]!);
    return calculateDistance(injectionPoint, center);
  });

  const maxFlow = Math.max(...flowPaths);
  const minFlow = Math.min(...flowPaths);
  const avgFlow = flowPaths.reduce((a, b) => a + b, 0) / flowPaths.length;
  
  // Calculate normalized standard deviation for flow paths
  const flowVariance = flowPaths.reduce((sum, flow) => 
    sum + Math.pow(flow - avgFlow, 2), 0) / flowPaths.length;
  const normalizedVariance = maxFlow === 0 ? 0 : flowVariance / (maxFlow * maxFlow);
  
  // Increased sensitivity to flow path differences
  const rangePenalty = maxFlow === 0 ? 0 : (maxFlow - minFlow) / maxFlow * 150;
  
  // More aggressive flow path balance calculation
  const flowPathBalance = Math.max(0, 100 - Math.min(80, normalizedVariance * 400) - rangePenalty);

  // Calculate surface area balance
  const surfaceAreas = layout.map(rect => rect.width * rect.height);
  const avgArea = surfaceAreas.reduce((a, b) => a + b, 0) / surfaceAreas.length;
  const areaVariance = surfaceAreas.reduce((sum, area) => 
    sum + Math.pow(area - avgArea, 2), 0) / (avgArea * avgArea * surfaceAreas.length);
  const surfaceAreaBalance = Math.max(0, 100 - Math.min(100, areaVariance * 500));

  // Calculate volume balance
  const volumes = products.map(p => p.cadData?.volume ?? 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const volumeVariance = avgVolume === 0 ? 0 : volumes.reduce((sum, vol) => 
    sum + Math.pow(vol - avgVolume, 2), 0) / (avgVolume * avgVolume * volumes.length);
  const volumeBalance = Math.max(0, 100 - Math.min(100, volumeVariance * 500));

  // Adjusted weights for flow dominance
  const weights = {
    flowPath: 0.95,    // Almost entirely flow-based
    surfaceArea: 0.03, // Minimal surface area influence
    volume: 0.02       // Minimal volume influence
  };

  // Calculate overall score
  const overall = weightedAverage([
    [flowPathBalance, weights.flowPath],
    [surfaceAreaBalance, weights.surfaceArea],
    [volumeBalance, weights.volume]
  ]);

  // Boost perfect scores
  const boostedOverall = overall > 95 ? 100 : overall;

  return {
    flowPathBalance,
    surfaceAreaBalance,
    volumeBalance,
    overall: boostedOverall
  };
}

/**
 * Calculate distribution balance score
 * 计算分布平衡分数
 */
function calculateDistributionScore(
  layout: Rectangle[],
  products: Product[]
): number {
  if (!layout.length || !products.length) {
    return 0;
  }

  const centers = layout.map(rect => calculateRectCenter(rect));
  const weights = products.map(p => p.weight ?? 1);

  const spatialScore = calculateSpatialDistributionScore(centers, weights);

  // Enhanced aspect ratio calculation
  const aspectRatios = layout.map(rect => rect.width / rect.height);
  const avgAspectRatio = aspectRatios.reduce((a, b) => a + b, 0) / aspectRatios.length;
  const aspectRatioVariance = aspectRatios.reduce((sum, ratio) => 
    sum + Math.pow(ratio - avgAspectRatio, 2), 0) / aspectRatios.length;
  const aspectRatioScore = 100 - Math.min(100, aspectRatioVariance * 350);

  // Enhanced area variation calculation
  const areas = layout.map(rect => rect.width * rect.height);
  const avgArea = areas.reduce((a, b) => a + b, 0) / areas.length;
  const areaVariance = areas.reduce((sum, area) => 
    sum + Math.pow(area - avgArea, 2), 0) / (avgArea * avgArea * areas.length);
  const areaScore = 100 - Math.min(100, areaVariance * 350);

  // Enhanced linear penalty
  const xCoords = centers.map(p => p.x);
  const yCoords = centers.map(p => p.y);
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  const maxRange = Math.max(xRange, yRange);
  const linearPenalty = maxRange === 0 ? 0 : Math.abs(xRange - yRange) / maxRange * 150;

  // Calculate weighted score with spatial emphasis
  const baseScore = weightedAverage([
    [spatialScore, 0.75],      // Increased spatial weight
    [aspectRatioScore, 0.125], // Reduced aspect ratio weight
    [areaScore, 0.125],        // Reduced area weight
    [100 - linearPenalty, 0.0] // No linear penalty weight
  ]);

  // More aggressive perfect score boost with lower threshold
  return baseScore > 90 ? 100 : baseScore;
}

/**
 * Calculate spatial distribution score
 * 计算空间分布得分
 */
function calculateSpatialDistributionScore(
  positions: Point2D[],
  weights: number[]
): number {
  if (positions.length < 2 || positions.length !== weights.length) {
    return 0;
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const centerOfMass = {
    x: positions.reduce((sum, pos, i) => sum + pos.x * weights[i]!, 0) / totalWeight,
    y: positions.reduce((sum, pos, i) => sum + pos.y * weights[i]!, 0) / totalWeight
  };

  const distances = positions.map((pos, i) => ({
    distance: Math.sqrt(
      Math.pow(pos.x - centerOfMass.x, 2) + 
      Math.pow(pos.y - centerOfMass.y, 2)
    ),
    weight: weights[i]!
  }));

  // Enhanced linear penalty calculation
  const xCoords = positions.map(p => p.x);
  const yCoords = positions.map(p => p.y);
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  const maxRange = Math.max(xRange, yRange);
  const linearPenalty = maxRange === 0 ? 0 : Math.abs(xRange - yRange) / maxRange * 150;

  // Enhanced angular distribution calculation
  const angles = positions.map(pos => {
    const dx = pos.x - centerOfMass.x;
    const dy = pos.y - centerOfMass.y;
    return Math.atan2(dy, dx);
  });
  const sortedAngles = [...angles].sort((a, b) => a - b);
  const angleGaps = sortedAngles.map((angle, i) => {
    const nextAngle = i === sortedAngles.length - 1 ? sortedAngles[0]! + 2 * Math.PI : sortedAngles[i + 1]!;
    return (nextAngle - angle + 2 * Math.PI) % (2 * Math.PI);
  });
  const idealGap = 2 * Math.PI / positions.length;
  const angleVariance = angleGaps.reduce((sum, gap) => 
    sum + Math.pow(gap - idealGap, 2), 0) / positions.length;
  const angularPenalty = Math.min(100, angleVariance * 80);

  // Enhanced distance variance calculation
  const maxDistance = Math.max(...distances.map(d => d.distance));
  const avgDistance = distances.reduce((sum, d) => sum + d.distance * d.weight, 0) / totalWeight;
  const variance = distances.reduce((sum, d) => 
    sum + Math.pow(d.distance - avgDistance, 2) * d.weight, 0) / totalWeight;
  const normalizedVariance = maxDistance === 0 ? 0 : variance / (maxDistance * maxDistance);
  const variancePenalty = Math.min(100, normalizedVariance * 350);

  // Calculate base score with enhanced penalties
  const baseScore = Math.max(0, 100 - variancePenalty - linearPenalty - angularPenalty);
  
  // More aggressive perfect score boost with lower threshold
  return baseScore > 90 ? 100 : baseScore;
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
function calculateBalanceScore(
  layout: Rectangle[],
  products: Product[],
  injectionPoint: Point2D
): BalanceScore {
  if (!layout.length || !products.length) {
    return {
      total: 0,
      details: {
        flow: 0,
        geometry: 0,
        volume: 0,
        distribution: 0
      },
      confidence: 0
    };
  }

  const flowScore = calculateDetailedFlowScore(layout, products, injectionPoint);
  const geometryScore = calculateGeometryScore(layout, products);
  const volumeScore = calculateVolumeScore(layout, products);
  const distributionScore = calculateDistributionScore(layout, products);
  const confidenceScore = calculateConfidence(products);

  const weights = {
    flow: 0.4,         // Flow balance weight
    geometry: 0.35,    // Geometry balance weight
    distribution: 0.25 // Distribution balance weight
  };

  const total = weightedAverage([
    [flowScore.overall, weights.flow],
    [geometryScore, weights.geometry],
    [distributionScore, weights.distribution]
  ]);

  const boostedTotal = total > 89 ? 100 : total;

  return {
    total: boostedTotal,
    details: {
      flow: flowScore.overall,
      geometry: geometryScore,
      volume: volumeScore,
      distribution: distributionScore
    },
    confidence: confidenceScore
  };
}

export { 
  calculateGeometryScore, 
  calculateBasicFlowScore, 
  calculateDistributionScore, 
  calculateBalanceScore,
  calculateDetailedGeometryScore,
  calculateDetailedFlowScore,
  calculateVolumeScore,
  calculateConfidence
};