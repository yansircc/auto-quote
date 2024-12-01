import type { Rectangle } from '@/types/core/geometry';
import type { DetailedDistributionScore } from '@/types/algorithm/balance/types';
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
      score: 1,
      details: {
        principalMoments: [0, 0],
        principalAxes: [[1, 0], [0, 1]],
        gyrationRadius: 0,
        isotropy: 1,
        centerDeviation: 0,
        volumeBalance: {
          densityVariance: 1,
          heightBalance: 1,
          massDistribution: 1,
          symmetry: 1
        }
      }
    };
  }

  // Handle single product case
  if (products.length === 1) {
    const rect = Object.values(layout)[0];
    if (!rect) {
      return {
        score: 0,
        details: {
          principalMoments: [0, 0],
          principalAxes: [[1, 0], [0, 1]],
          gyrationRadius: 0,
          isotropy: 0,
          centerDeviation: 1,
          volumeBalance: {
            densityVariance: 0,
            heightBalance: 0,
            massDistribution: 0,
            symmetry: 0
          }
        }
      };
    }

    // Calculate center deviation
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const maxDimension = Math.max(rect.width, rect.height);
    const centerDeviation = Math.sqrt(centerX * centerX + centerY * centerY) / maxDimension;

    // Score based on center deviation
    const score = Math.max(0, Math.min(1, 1 - centerDeviation / 2));

    return {
      score,
      details: {
        principalMoments: [0, 0],
        principalAxes: [[1, 0], [0, 1]],
        gyrationRadius: 0,
        isotropy: score,
        centerDeviation,
        volumeBalance: {
          densityVariance: score,
          heightBalance: score,
          massDistribution: score,
          symmetry: score
        }
      }
    };
  }

  // Initialize calculators
  const physicsCalc = new PhysicsCalculator();
  const spatialCalc = new SpatialCalculator();
  const volumeCalc = new VolumeCalculator();

  try {
    // Calculate physical properties
    const physicalAnalysis = physicsCalc.calculate(layout, products);
    const physicalDetails = physicsCalc.toScoreDetails(physicalAnalysis);

    // Calculate spatial properties
    const spatialAnalysis = spatialCalc.calculate(layout, products);
    const spatialDetails = spatialCalc.toScoreDetails(spatialAnalysis);

    // Calculate volume properties
    const volumeDetails = volumeCalc.calculate(layout, products);

    // Combine scores with weights
    const weights = {
      physical: 0.35,
      spatial: 0.35,
      volume: 0.3
    };

    const finalScore = Math.min(1,
      physicalDetails.isotropy * weights.physical +
      (spatialAnalysis.uniformity / 100) * weights.spatial +
      volumeDetails.score * weights.volume / 100 // Convert volume score from 0-100 to 0-1
    );

    return {
      score: finalScore,
      details: {
        principalMoments: physicalDetails.principalMoments,
        principalAxes: physicalDetails.principalAxes,
        gyrationRadius: physicalDetails.gyrationRadius,
        isotropy: physicalDetails.isotropy,
        centerDeviation: physicalDetails.centerDeviation,
        volumeBalance: volumeDetails.details
      }
    };
  } catch (error) {
    console.error('Error calculating distribution score:', error);
    return {
      score: 0,
      details: {
        principalMoments: [0, 0],
        principalAxes: [[1, 0], [0, 1]],
        gyrationRadius: 0,
        isotropy: 0,
        centerDeviation: 1,
        volumeBalance: {
          densityVariance: 0,
          heightBalance: 0,
          massDistribution: 0,
          symmetry: 0
        }
      }
    };
  }
}
