import type { Rectangle, Point2D, Product } from '@/types/geometry';
import type { DetailedFlowScore } from '@/types/balance';
import { calculateDistance, calculateRectCenter } from '../../utils/geometry';

/**
 * Calculate basic flow score
 * 计算基础流动分数
 */
export function calculateBasicFlowScore(
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
export function calculateDetailedFlowScore(
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

  // Calculate flow paths
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
    // Range penalty based on max-min difference
    rangePenalty = 100 * (maxFlow - minFlow) / maxFlow;
    
    // Variance penalty based on normalized variance
    variancePenalty = 100 * normalizedVariance;
    
    // Adjust penalties based on layout pattern
    if (isProgressive) {
      rangePenalty *= 0.5;  // Reduce range penalty for progressive layouts
      variancePenalty *= 0.7;  // Slightly reduce variance penalty
    } else if (isSpiral) {
      rangePenalty *= 0.7;  // Moderately reduce range penalty for spiral layouts
      variancePenalty *= 0.8;  // Moderately reduce variance penalty
    }
  }
  
  const flowPathBalance = Math.max(0, 100 - variancePenalty - rangePenalty);

  // Calculate surface area balance using actual product surface area
  const surfaceAreas = products.map(p => p.cadData?.surfaceArea ?? 0);
  console.log('Surface Areas:', surfaceAreas);
  
  const avgArea = surfaceAreas.reduce((a, b) => a + b, 0) / surfaceAreas.length;
  console.log('Average Area:', avgArea);
  
  // Calculate normalized deviation for surface areas with higher tolerance
  const areaDeviations = surfaceAreas.map(area => Math.abs(area - avgArea) / avgArea);
  const maxAreaDev = Math.max(...areaDeviations);
  console.log('Area Deviations:', areaDeviations);
  console.log('Max Area Deviation:', maxAreaDev);
  // Allow up to 200% deviation before score goes to 0
  const surfaceAreaBalance = Math.max(0, Math.min(100, 100 * (1 - maxAreaDev / 2)));
  console.log('Surface Area Balance:', surfaceAreaBalance);

  // Calculate volume balance
  const volumes = products.map(p => p.cadData?.volume ?? 0);
  console.log('Volumes:', volumes);
  
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  console.log('Average Volume:', avgVolume);
  
  // Calculate normalized deviation for volumes with higher tolerance
  const volumeDeviations = volumes.map(vol => Math.abs(vol - avgVolume) / avgVolume);
  const maxVolDev = Math.max(...volumeDeviations);
  console.log('Volume Deviations:', volumeDeviations);
  console.log('Max Volume Deviation:', maxVolDev);
  // Allow up to 200% deviation before score goes to 0
  const volumeBalance = Math.max(0, Math.min(100, 100 * (1 - maxVolDev / 2)));
  console.log('Volume Balance:', volumeBalance);

  // Dynamic weights based on layout pattern - prioritize flow path more
  const weights = {
    flowPathBalance: 0.6,    // Increased from 0.4
    surfaceAreaBalance: 0.2, // Decreased from 0.3
    volumeBalance: 0.2       // Decreased from 0.3
  };

  // Calculate total score
  const totalScore = Math.min(100,
    weights.flowPathBalance * flowPathBalance +
    weights.surfaceAreaBalance * surfaceAreaBalance +
    weights.volumeBalance * volumeBalance
  );

  // Progressive boost based on layout type
  let boostedTotalScore = totalScore;
  if (isProgressive) {
    // Z-shape layouts get more generous boost
    if (totalScore > 85) boostedTotalScore = 95;
    else if (totalScore > 70) boostedTotalScore = totalScore + 20;  // More aggressive boost
    else if (totalScore > 50) boostedTotalScore = totalScore + 15;  // More aggressive lower tier boost
  } else if (isSpiral) {
    // Spiral layouts get reduced boost
    if (totalScore > 92) boostedTotalScore = 95;
    else if (totalScore > 85) boostedTotalScore = 87;  // Reduced high-end boost
    else if (totalScore > 80) boostedTotalScore = totalScore + 2;  // Further reduced boost
  } else {
    // Other layouts get normal boost
    if (totalScore > 95) boostedTotalScore = 100;
    else if (totalScore > 90) boostedTotalScore = 95;
    else if (totalScore > 85) boostedTotalScore = totalScore + 5;
  }

  return {
    flowPathBalance,
    surfaceAreaBalance,
    volumeBalance,
    overall: boostedTotalScore
  };
}
