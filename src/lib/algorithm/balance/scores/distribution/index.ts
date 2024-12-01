import type { Rectangle, Product } from '@/types/geometry';
import type { DetailedDistributionScore } from '@/types/balance';
import { PhysicsCalculator } from './calculators/physics';
import { SpatialCalculator } from './calculators/spatial';
import { VolumeCalculator } from './calculators/volume';

/**
 * Calculate distribution balance score
 * Uses physics and linear algebra methods to evaluate layout balance
 * 
 * Core metrics:
 * 1. Physical Properties - Mass distribution and isotropy
 * 2. Spatial Properties - Symmetry and uniformity
 * 3. Volume Properties - Height and density distribution
 */
export function calculateDistributionScore(
  layout: Record<number, Rectangle>,
  products: Product[]
): DetailedDistributionScore {
  // Handle empty case
  if (products.length === 0) {
    return {
      score: 100,
      details: {
        principalMoments: [0, 0],
        principalAxes: [[1, 0], [0, 1]],
        gyrationRadius: 0,
        isotropy: 1,
        centerDeviation: 0,
        volumeBalance: {
          densityVariance: 0,
          heightBalance: 1,
          massDistribution: 1
        }
      }
    };
  }

  // Initialize calculators
  const physicsCalc = new PhysicsCalculator();
  const spatialCalc = new SpatialCalculator();
  const volumeCalc = new VolumeCalculator();

  // Calculate physical properties
  const physicalAnalysis = physicsCalc.calculate(layout, products);
  const physicalDetails = physicsCalc.toScoreDetails(physicalAnalysis);

  // Calculate spatial properties
  const spatialAnalysis = spatialCalc.calculate(layout, products);
  const spatialDetails = spatialCalc.toScoreDetails(spatialAnalysis);

  // Calculate volume properties
  const volumeAnalysis = volumeCalc.calculate(layout, products);

  // Combine scores with weights
  const physicalScore = physicalDetails.isotropy * 0.25;  // 物理分数权重
  const symmetryScore = (spatialAnalysis.symmetry / 100) * 0.35;  // 对称性权重
  const uniformityScore = (spatialAnalysis.uniformity / 100) * 0.2;  // 均匀性权重
  const volumeScore = (volumeAnalysis.score / 100) * 0.2;  // 体积分数权重
  
  console.log(
    `Raw scores before normalization:`,
    `\nphysical=${physicalDetails.isotropy}`,
    `\nsymmetry=${spatialAnalysis.symmetry}`,
    `\nuniformity=${spatialAnalysis.uniformity}`,
    `\nvolume=${volumeAnalysis.score}`
  );

  console.log(
    `Weighted scores:`,
    `\nphysical=${(physicalScore*100).toFixed(1)}%`,
    `\nsymmetry=${(symmetryScore*100).toFixed(1)}%`,
    `\nuniformity=${(uniformityScore*100).toFixed(1)}%`,
    `\nvolume=${(volumeScore*100).toFixed(1)}%`,
    `\ntotal=${Math.round((physicalScore + symmetryScore + uniformityScore + volumeScore) * 100)}%`
  );

  const score = Math.round(
    (physicalScore + symmetryScore + uniformityScore + volumeScore) * 100
  );  // 先乘以100再取整，避免小数被舍入为0

  return {
    score,
    details: {
      ...physicalDetails,
      ...spatialDetails,
      volumeBalance: volumeAnalysis.details
    }
  };
}
