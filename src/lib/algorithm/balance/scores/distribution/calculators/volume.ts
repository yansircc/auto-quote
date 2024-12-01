import type { Rectangle, Product } from '@/types/geometry';
import { DistributionBalanceConfig as Config } from '../config';
import { SymmetryAnalyzer } from '../utils/symmetry';

/**
 * Calculator for volume distribution analysis
 * Analyzes height and density distribution in a 2D layout
 */
export interface VolumeCalculatorResult {
  score: number;
  details: {
    densityVariance: number;
    heightBalance: number;
    massDistribution: number;
    symmetry: number;
  };
}

export class VolumeCalculator {
  private config: Required<VolumeDistributionConfig>;
  private symmetryAnalyzer: SymmetryAnalyzer;

  constructor(config: Partial<VolumeDistributionConfig> = {}) {
    this.config = {
      ...DEFAULT_VOLUME_DISTRIBUTION_CONFIG,
      weights: {
        ...DEFAULT_VOLUME_DISTRIBUTION_CONFIG.weights,
        ...(config.weights ?? {})
      }
    };
    this.symmetryAnalyzer = new SymmetryAnalyzer({
      minQualityThreshold: this.config.minSymmetryQuality,
      distanceDecayFactor: this.config.symmetryDistanceDecay
    });
  }

  /**
   * Calculate volume distribution score and details
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): VolumeCalculatorResult {
    // Handle empty case
    if (products.length === 0) {
      return {
        score: 100,
        details: {
          densityVariance: 1,
          heightBalance: 1,
          massDistribution: 1,
          symmetry: 1
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
            densityVariance: 0,
            heightBalance: 0,
            massDistribution: 0,
            symmetry: 0
          }
        };
      }

      // For single product, calculate based on center position
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const maxDimension = Math.max(rect.width, rect.height);
      const centerDeviation = Math.sqrt(centerX * centerX + centerY * centerY) / maxDimension;

      // More lenient scoring for single product
      const score = Math.max(0, Math.min(100, (1 - centerDeviation) * 100));

      return {
        score,
        details: {
          densityVariance: score / 100,
          heightBalance: 1, // Single product is always height balanced
          massDistribution: score / 100,
          symmetry: score / 100
        }
      };
    }

    // Calculate volume distribution
    const volumes = this.calculateVolumes(layout, products);
    const densityVariance = this.calculateDensityVariance(volumes);
    const heightBalance = this.calculateHeightBalance(layout, products);
    const massDistribution = this.calculateMassDistribution(layout, products);
    const symmetry = this.calculateSymmetryScore(layout, products);

    // Combine scores with weights
    const weights = {
      densityVariance: 0.3,
      heightBalance: 0.2,
      massDistribution: 0.3,
      symmetry: 0.2
    };

    const score = Math.min(100,
      densityVariance * weights.densityVariance * 100 +
      heightBalance * weights.heightBalance * 100 +
      massDistribution * weights.massDistribution * 100 +
      symmetry * weights.symmetry * 100
    );

    return {
      score,
      details: {
        densityVariance,
        heightBalance,
        massDistribution,
        symmetry
      }
    };
  }

  /**
   * Calculate density variance score
   * @private
   */
  private calculateDensityVariance(volumes: number[]): number {
    if (volumes.length <= 1) return 1;

    const mean = volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;
    if (mean === 0) return 0;

    const variance = volumes.reduce((sum, volume) => sum + Math.pow(volume - mean, 2), 0) / volumes.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    
    // Convert coefficient of variation to score
    const maxAcceptableCV = this.config.maxAcceptableCV;
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation / maxAcceptableCV));
  }

  /**
   * Calculate height balance score
   * @private
   */
  private calculateHeightBalance(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number {
    if (products.length <= 1) return 1;

    const heights = products.map(product => {
      const rect = layout[product.id];
      return rect ? rect.height : 0;
    });

    const mean = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    if (mean === 0) return 0;

    const variance = heights.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / heights.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // More lenient scoring for height balance
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation / 2));
  }

  /**
   * Calculate mass distribution score
   * @private
   */
  private calculateMassDistribution(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number {
    if (products.length <= 1) return 1;

    const centerOfMass = this.calculateCenterOfMass(layout, products);
    if (!centerOfMass) return 0;

    // Calculate distance from geometric center
    const bounds = this.getLayoutBounds(layout);
    if (!bounds) return 0;

    const geometricCenterX = (bounds.maxX + bounds.minX) / 2;
    const geometricCenterY = (bounds.maxY + bounds.minY) / 2;

    const maxDistance = Math.sqrt(
      Math.pow(bounds.maxX - bounds.minX, 2) +
      Math.pow(bounds.maxY - bounds.minY, 2)
    ) / 2;

    const distance = Math.sqrt(
      Math.pow(centerOfMass.x - geometricCenterX, 2) +
      Math.pow(centerOfMass.y - geometricCenterY, 2)
    );

    // More lenient scoring for mass distribution
    return Math.max(0, Math.min(1, 1 - distance / maxDistance));
  }

  /**
   * Calculate symmetry score
   * @private
   */
  private calculateSymmetryScore(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number {
    if (products.length <= 1) return 1;

    const points = products.map(product => {
      const rect = layout[product.id];
      return rect ? {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        weight: rect.width * rect.height
      } : null;
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    if (points.length === 0) return 0;

    // Find principal axes
    const principalAxes = this.findPrincipalAxes(points);
    if (!principalAxes) return 0;

    // Calculate symmetry quality
    const quality = this.calculateSymmetryQuality(points, principalAxes);

    // More lenient scoring for symmetry
    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Get bounds of layout
   * @private
   */
  private getLayoutBounds(
    layout: Record<number, Rectangle>
  ): { minX: number; maxX: number; minY: number; maxY: number; } | null {
    const positions = Object.values(layout);
    if (!positions || positions.length === 0) return null;

    const firstPos = positions[0];
    if (!firstPos) return null;

    const initialBounds = {
      minX: firstPos.x,
      maxX: firstPos.x + firstPos.width,
      minY: firstPos.y,
      maxY: firstPos.y + firstPos.height
    };

    return positions.reduce(
      (bounds, pos) => ({
        minX: Math.min(bounds.minX, pos.x),
        maxX: Math.max(bounds.maxX, pos.x + pos.width),
        minY: Math.min(bounds.minY, pos.y),
        maxY: Math.max(bounds.maxY, pos.y + pos.height)
      }),
      initialBounds
    );
  }

  /**
   * Create density grid for layout
   * @private
   */
  private createDensityGrid(
    layout: Record<number, Rectangle>,
    products: Product[],
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    },
    gridSize: number
  ): number[][] {
    // Initialize grid with explicit typing
    const grid: number[][] = Array.from(
      { length: gridSize },
      () => Array.from({ length: gridSize }, () => 0)
    );

    // Calculate cell size
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Fill grid with product volumes
    products.forEach(product => {
      const rect = layout[product.id];
      if (!rect) return; // Skip if no layout position found

      const volume = (product.dimensions?.width ?? 0) * 
                    (product.dimensions?.length ?? 0) * 
                    (product.dimensions?.height ?? 0);

      // Calculate grid cells covered by this product
      const startX = Math.floor((rect.x - bounds.minX) / cellWidth);
      const startY = Math.floor((rect.y - bounds.minY) / cellHeight);
      const endX = Math.min(
        gridSize - 1,
        Math.floor((rect.x + rect.width - bounds.minX) / cellWidth)
      );
      const endY = Math.min(
        gridSize - 1,
        Math.floor((rect.y + rect.height - bounds.minY) / cellHeight)
      );

      // Add volume to covered cells
      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          if (x >= 0 && y >= 0 && x < gridSize && y < gridSize) {
            const coverage = this.calculateCellCoverage(
              rect,
              bounds.minX + x * cellWidth,
              bounds.minY + y * cellHeight,
              cellWidth,
              cellHeight
            );
            grid[y][x] += volume * coverage;
          }
        }
      }
    });

    return grid;
  }

  /**
   * Calculate how much of a cell is covered by a rectangle
   * @private
   */
  private calculateCellCoverage(
    rect: Rectangle,
    cellX: number,
    cellY: number,
    cellWidth: number,
    cellHeight: number
  ): number {
    const overlapX = Math.min(
      rect.x + rect.width - cellX,
      cellWidth,
      rect.width,
      rect.x + rect.width - cellX
    );
    const overlapY = Math.min(
      rect.y + rect.height - cellY,
      cellHeight,
      rect.height,
      rect.y + rect.height - cellY
    );

    return Math.max(0, overlapX) * Math.max(0, overlapY) / (cellWidth * cellHeight);
  }

  private calculateVolumes(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number[] {
    return products.map(product => {
      const rect = layout[product.id];
      if (!rect || !product.dimensions) return 0;
      
      return (product.dimensions?.width ?? 0) * 
             (product.dimensions?.length ?? 0) * 
             (product.dimensions?.height ?? 0);
    });
  }

  private calculateCenterOfMass(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): { x: number; y: number } | null {
    let totalMass = 0;
    let centerX = 0;
    let centerY = 0;

    products.forEach((product, i) => {
      const rect = layout[i];
      if (!rect || !product.dimensions) return;
      
      const mass = product.weight || 1; // Default to 1 if weight not specified
      totalMass += mass;
      centerX += rect.x * mass;
      centerY += rect.y * mass;
    });

    if (totalMass === 0) return null;

    centerX /= totalMass;
    centerY /= totalMass;

    return { x: centerX, y: centerY };
  }

  private findPrincipalAxes(points: { x: number; y: number; weight: number }[]): { x: number; y: number }[] | null {
    // Implement principal axes calculation
    // For demonstration purposes, return a simple axis
    return [{ x: 0, y: 1 }];
  }

  private calculateSymmetryQuality(points: { x: number; y: number; weight: number }[], axes: { x: number; y: number }[]): number {
    // Implement symmetry quality calculation
    // For demonstration purposes, return a simple quality score
    return 0.5;
  }
}

interface VolumeDistributionConfig {
  /** Maximum acceptable coefficient of variation for height balance */
  maxAcceptableCV: number;
  /** Minimum quality threshold for symmetry axes */
  minSymmetryQuality: number;
  /** Distance decay factor for symmetry quality */
  symmetryDistanceDecay: number;
  /** Score weights */
  weights: {
    heightBalance: number;
    symmetry: number;
    details: number;
  };
}

const DEFAULT_VOLUME_DISTRIBUTION_CONFIG: VolumeDistributionConfig = {
  maxAcceptableCV: 0.5,
  minSymmetryQuality: 0.35,
  symmetryDistanceDecay: 100,
  weights: {
    heightBalance: 0.4,
    symmetry: 0.4,
    details: 0.2
  }
};
