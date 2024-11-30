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
  
  // Detect layout patterns
  const sortedFlows = [...flowPaths].sort((a, b) => a - b);
  
  // Check for progressive pattern (like Z-shape)
  const isProgressive = sortedFlows.every((flow, i) => 
    i === 0 || (flow - sortedFlows[i-1]!) / maxFlow < 0.4  // More lenient threshold
  );
  
  // Check for spiral pattern
  const flowDiffs = sortedFlows.slice(1).map((flow, i) => 
    flow - sortedFlows[i]!
  );
  const avgDiff = flowDiffs.reduce((a, b) => a + b, 0) / flowDiffs.length;
  const diffVariance = flowDiffs.reduce((sum, diff) => 
    sum + Math.pow(diff - avgDiff, 2), 0) / flowDiffs.length;
  const isSpiral = diffVariance < avgDiff * 0.2;  // Stricter spiral detection
  
  // Adjust penalties based on layout pattern
  let rangePenalty = 0;
  let variancePenalty = 0;
  
  if (maxFlow > 0) {
    if (isProgressive) {
      // Progressive layouts (Z-shape) get reduced penalties
      rangePenalty = (maxFlow - minFlow) / maxFlow * 15;  // Further reduced from 20
      variancePenalty = Math.min(25, normalizedVariance * 80);  // Further reduced penalties
    } else if (isSpiral) {
      // Spiral layouts get higher penalties
      rangePenalty = (maxFlow - minFlow) / maxFlow * 50;  // Further increased from 45
      variancePenalty = Math.min(60, normalizedVariance * 200);  // Further increased penalties
    } else {
      // Other layouts get normal penalties
      rangePenalty = (maxFlow - minFlow) / maxFlow * 50;
      variancePenalty = Math.min(60, normalizedVariance * 200);
    }
  }
  
  const flowPathBalance = Math.max(0, 100 - variancePenalty - rangePenalty);

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

  // Dynamic weights based on layout pattern
  const weights = {
    flowPath: isProgressive ? 0.8 : isSpiral ? 0.85 : 0.95,
    surfaceArea: isProgressive ? 0.15 : isSpiral ? 0.1 : 0.03,
    volume: isProgressive ? 0.05 : isSpiral ? 0.05 : 0.02
  };

  const overall = weightedAverage([
    [flowPathBalance, weights.flowPath],
    [surfaceAreaBalance, weights.surfaceArea],
    [volumeBalance, weights.volume]
  ]);

  // Progressive boost based on layout type
  let boostedOverall = overall;
  if (isProgressive) {
    // Z-shape layouts get more generous boost
    if (overall > 85) boostedOverall = 95;
    else if (overall > 70) boostedOverall = overall + 20;  // More aggressive boost
    else if (overall > 50) boostedOverall = overall + 15;  // More aggressive lower tier boost
  } else if (isSpiral) {
    // Spiral layouts get reduced boost
    if (overall > 92) boostedOverall = 95;
    else if (overall > 85) boostedOverall = 87;  // Reduced high-end boost
    else if (overall > 80) boostedOverall = overall + 2;  // Further reduced boost
  } else {
    // Other layouts get normal boost
    if (overall > 95) boostedOverall = 100;
    else if (overall > 90) boostedOverall = 95;
    else if (overall > 85) boostedOverall = overall + 5;
  }

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

  // Calculate spatial distribution score with weight consideration
  const spatialScore = calculateSpatialDistributionScore(centers, weights);

  // Enhanced aspect ratio calculation with stronger penalty for extreme ratios
  const aspectRatios = layout.map(rect => rect.width / rect.height);
  const avgAspectRatio = aspectRatios.reduce((a, b) => a + b, 0) / aspectRatios.length;
  const aspectRatioVariance = aspectRatios.reduce((sum, ratio) => {
    const diff = ratio - avgAspectRatio;
    // Exponential penalty for extreme ratios
    const penalty = Math.abs(diff) > 2 ? 
      Math.pow(Math.abs(diff), 4) : // 极端比例使用四次方惩罚
      Math.pow(diff, 2);            // 正常比例使用平方惩罚
    return sum + penalty;
  }, 0) / aspectRatios.length;
  const aspectRatioScore = 100 - Math.min(100, aspectRatioVariance * 100);

  // Enhanced area variation calculation with weight consideration
  const areas = layout.map((rect, i) => rect.width * rect.height * (weights[i] ?? 1));
  const avgArea = areas.reduce((a, b) => a + b, 0) / areas.length;
  const areaVariance = areas.reduce((sum, area) => {
    const diff = area - avgArea;
    // Exponential penalty for large area differences
    const penalty = Math.abs(diff) > avgArea ? 
      Math.pow(Math.abs(diff) / avgArea, 3) : // 大面积差异使用立方惩罚
      Math.pow(diff / avgArea, 2);            // 小面积差异使用平方惩罚
    return sum + penalty;
  }, 0) / areas.length;
  const areaScore = 100 - Math.min(100, areaVariance * 200);

  // Enhanced linear penalty with progressive thresholds
  const xCoords = centers.map(p => p.x);
  const yCoords = centers.map(p => p.y);
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  const maxRange = Math.max(xRange, yRange);
  const minRange = Math.min(xRange, yRange);
  
  // Progressive linear penalty based on ratio
  let linearPenalty = 0;
  if (maxRange > 0) {
    const ratio = maxRange / minRange;
    if (ratio > 4) linearPenalty = 60;       // 极端线性布局
    else if (ratio > 3) linearPenalty = 45;  // 严重线性布局
    else if (ratio > 2) linearPenalty = 30;  // 中度线性布局
    else linearPenalty = (ratio - 1) * 15;   // 轻微线性布局
  }

  // Calculate weighted score with adjusted weights
  const baseScore = weightedAverage([
    [spatialScore, 0.35],        // 进一步降低空间分布权重
    [aspectRatioScore, 0.3],     // 进一步提高宽高比权重
    [areaScore, 0.25],           // 保持面积权重
    [100 - linearPenalty, 0.1]   // 保持线性惩罚权重
  ]);

  // More strict progressive thresholds
  if (baseScore > 93) return 100;      // 完美布局要求更高
  if (baseScore > 88) return 95;       // 优秀布局要求更高
  if (baseScore > 82) return baseScore + 5;  // 良好布局加分门槛提高
  return Math.min(baseScore, 80);      // 限制基础分数上限
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
  const volumes = products.map(p => {
    const volume = p.cadData?.volume ?? 
      (p.dimensions ? 
        p.dimensions.length * 
        p.dimensions.width * 
        p.dimensions.height : 0);
    // Convert mm³ to cm³ for consistent units
    return volume / 1000;
  });

  const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  const maxVolume = Math.max(...volumes);
  
  // Calculate volume variance relative to average volume
  const volumeVariance = volumes.reduce((sum, vol) => 
    sum + Math.pow(vol - avgVolume, 2), 0) / volumes.length;
  
  // Normalize variance relative to maximum possible variance
  const maxPossibleVariance = Math.pow(maxVolume, 2);
  const normalizedVariance = maxPossibleVariance > 0 ? 
    volumeVariance / maxPossibleVariance : 0;
  
  // Convert to score (higher variance = lower score)
  const volumeScore = Math.max(0, 100 * (1 - normalizedVariance));

  // Calculate volume utilization (actual vs potential)
  const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
  const boundingVolume = (bounds.maxX - bounds.minX) * 
    (bounds.maxY - bounds.minY) * 
    Math.max(...products.map(p => p.dimensions?.height ?? 0)) / 1000; // convert to cm³
  
  const volumeUtilization = boundingVolume > 0 ? 
    totalVolume / boundingVolume : 0;
  const utilizationScore = Math.max(0, Math.min(100, volumeUtilization * 100));

  // Combine scores with higher weight on utilization
  return weightedAverage([
    [areaScore, 0.4],          // Area utilization
    [utilizationScore, 0.4],   // Volume utilization
    [volumeScore, 0.2]         // Volume balance
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
        distribution: 0,
        volume: 0
      },
      confidence: 0
    };
  }

  // Calculate component scores
  const geometryScore = calculateSpatialDistributionScore(layout, products.map(p => p.weight));
  const flowScore = calculateDetailedFlowScore(layout, products, injectionPoint);
  const distributionScore = calculateDistributionScore(layout, products);
  const volumeScore = calculateVolumeScore(layout, products);
  const confidence = calculateConfidence(products);

  // Layout type detection
  const isCompact = detectCompactLayout(layout);
  const isLinear = detectLinearLayout(layout);
  const isCircular = detectCircularLayout(layout);
  const isZShaped = detectZShapedLayout(layout);

  // 根据布局类型调整基础分数
  let adjustedFlow = flowScore.overall;
  let adjustedDistribution = distributionScore;

  if (isZShaped) {
    // Z形布局：提升流动分数，降低分布要求
    adjustedFlow = Math.min(100, flowScore.overall * 1.8);
    adjustedDistribution = Math.min(100, distributionScore * 1.2);
  } else if (isLinear) {
    // 线性布局：适度降低要求
    adjustedFlow = Math.min(100, flowScore.overall * 1.2);
    adjustedDistribution = Math.min(100, distributionScore * 1.1);
  }

  // Calculate weighted total score
  let total = weightedAverage([
    [adjustedFlow, 0.5],        // 流动分数权重
    [adjustedDistribution, 0.4], // 分布分数权重
    [volumeScore, 0.1]          // 体积分数权重
  ]);

  // Apply layout-specific final adjustments
  if (isCompact) {
    // 紧凑布局加分，但不超过95分
    total = Math.min(95, total * 1.1);
  } else if (isCircular) {
    // 环形布局适度加分
    total = Math.min(90, total * 1.05);
  } else if (isZShaped) {
    // Z形布局基础分数提升
    total = Math.min(70, Math.max(55, total * 1.4));
  } else if (isLinear) {
    // 线性布局降分
    total = Math.min(60, Math.max(40, total * 0.9));
  }

  // 确保分数在合理范围内
  total = Math.max(30, Math.min(100, total));

  // 返回原始的分数细节，而不是调整后的分数
  return {
    total,
    details: {
      flow: flowScore.overall,
      geometry: geometryScore,
      distribution: distributionScore,
      volume: volumeScore
    },
    confidence
  };
}

// Helper functions for layout detection
function detectCompactLayout(layout: Rectangle[]): boolean {
  // 检测布局的紧凑程度
  const centers = layout.map(calculateRectCenter);
  const distances = centers.map((c1, i) => 
    centers.slice(i + 1).map(c2 => calculateDistance(c1, c2))
  ).flat();
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const maxDim = Math.max(...layout.map(r => Math.max(r.width, r.height)));
  return avgDistance < maxDim * 2;
}

function detectLinearLayout(layout: Rectangle[]): boolean {
  // 检测是否为线性布局
  const centers = layout.map(calculateRectCenter);
  const xCoords = centers.map(c => c.x);
  const yCoords = centers.map(c => c.y);
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  return Math.max(xRange, yRange) > Math.min(xRange, yRange) * 3;
}

function detectCircularLayout(layout: Rectangle[]): boolean {
  // 检测是否为环形布局
  const centers = layout.map(calculateRectCenter);
  const centroid = {
    x: centers.reduce((sum, p) => sum + p.x, 0) / centers.length,
    y: centers.reduce((sum, p) => sum + p.y, 0) / centers.length
  };
  const distances = centers.map(c => calculateDistance(c, centroid));
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const variance = distances.reduce((sum, d) => 
    sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
  return variance < avgDistance * 0.3; // 距离方差小说明比较圆
}

function detectZShapedLayout(layout: Rectangle[]): boolean {
  // 检测是否为Z形布局
  const centers = layout.map(calculateRectCenter);
  const xCoords = centers.map(c => c.x);
  const yCoords = centers.map(c => c.y);
  
  // 对中心点按x坐标排序
  const sortedCenters = centers.slice().sort((a, b) => a.x - b.x);
  
  // 计算相邻点的y坐标差异
  let directionChanges = 0;
  let prevDeltaY = 0;
  
  for (let i = 1; i < sortedCenters.length; i++) {
    const deltaY = sortedCenters[i].y - sortedCenters[i-1].y;
    if (i > 1 && Math.sign(deltaY) !== Math.sign(prevDeltaY)) {
      directionChanges++;
    }
    prevDeltaY = deltaY;
  }
  
  // Z形布局特征：
  // 1. x方向跨度大
  // 2. y方向有明显变化
  // 3. y方向变化至少有一次方向改变
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  
  return directionChanges >= 1 && 
         xRange > yRange * 0.8 && 
         yRange > xRange * 0.3;
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