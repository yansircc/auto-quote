import type { Point2D } from '@/types/geometry';

/**
 * Distribution score configuration
 */
export interface DistributionConfig {
  // Symmetry detection thresholds
  symmetric: {
    default: number;  // Default threshold for symmetry detection
    min: number;      // Minimum acceptable threshold
    max: number;      // Maximum acceptable threshold
  };
  
  // Progressive layout thresholds
  progressive: {
    default: number;  // Default threshold for progressive layouts
    min: number;      // Minimum acceptable threshold
    max: number;      // Maximum acceptable threshold
  };
  
  // Physical properties
  physics: {
    inertia: {
      weightFactor: number;     // Weight factor for inertia calculations
      momentThreshold: number;  // Threshold for moment of inertia
    };
    mass: {
      centerTolerance: number;  // Tolerance for center of mass deviation
      balanceWeight: number;    // Weight for mass balance in scoring
    };
  };
  
  // Scoring weights
  weights: {
    symmetry: number;    // Weight for symmetry score
    balance: number;     // Weight for balance score
    uniformity: number;  // Weight for uniformity score
  };
  
  // Penalty factors
  penalties: {
    asymmetry: number;      // Penalty factor for asymmetric layouts
    imbalance: number;      // Penalty factor for imbalanced layouts
    nonUniformity: number;  // Penalty factor for non-uniform distributions
  };

  // Physical balance parameters
  maxInertiaRadius: number;
  maxCenterDeviation: number;

  // Spatial balance parameters
  minSymmetryScore: number;
  minUniformityScore: number;

  // Volume balance parameters
  gridSize: number;
  maxDensityVariance: number;
  maxHeightDeviation: number;
}

/**
 * Internal physical analysis results
 */
export interface InternalPhysicalAnalysis {
  mass: {
    total: number;
    center: Point2D;
    distribution: number[];
  };
  
  inertia: {
    tensor: [number, number, number];  // [Ixx, Iyy, Ixy]
    principal: {
      moments: [number, number];
      axes: [[number, number], [number, number]];
    };
    gyrationRadius: number;
  };
}
