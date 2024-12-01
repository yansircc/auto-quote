import type { Rectangle, Product, Point2D } from '@/types/geometry';
import type { DetailedDistributionScore } from '@/types/balance';
import { DistributionBalanceConfig as Config } from '../config';
import { SymmetryAnalyzer } from '../utils/symmetry';

/**
 * Internal spatial analysis result
 */
interface SpatialAnalysis {
  symmetry: number;
  uniformity: number;
  axes: {
    angle: number;
    quality: number;
  }[];
}

/**
 * Calculator for spatial distribution properties
 * Analyzes symmetry, uniformity, and balance of layout
 */
export class SpatialCalculator {
  private symmetryAnalyzer = new SymmetryAnalyzer();

  /**
   * Calculate spatial distribution score
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): SpatialAnalysis {
    // Convert layout to points with weights
    const points: Point2D[] = [];
    const weights: number[] = [];
    
    // Create a map of product IDs to weights for safer lookup
    const productWeights = new Map(products.map(p => [
      p.id,
      p.weight ?? (p.dimensions ? 
        p.dimensions.width * 
        p.dimensions.length * 
        p.dimensions.height : 1)
    ]));

    // Process each rectangle in the layout
    for (const [id, rect] of Object.entries(layout)) {
      const weight = productWeights.get(Number(id));
      if (weight === undefined) {
        throw new Error(`Product not found for layout position ${id}`);
      }

      points.push({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      });
      weights.push(weight);
    }

    // Find symmetry axes
    const axes = this.symmetryAnalyzer.findSymmetryAxes(points, weights);
    
    // Calculate symmetry score
    const symmetry = this.calculateSymmetryScore(axes);
    
    // Calculate uniformity score
    const uniformity = this.calculateUniformityScore(points, weights);

    return {
      symmetry,
      uniformity,
      axes
    };
  }

  /**
   * Convert spatial analysis to distribution score details
   */
  toScoreDetails(analysis: SpatialAnalysis): Partial<DetailedDistributionScore['details']> {
    // Convert best symmetry axis to principal axis
    const bestAxis = analysis.axes.reduce(
      (best, axis) => axis.quality > best.quality ? axis : best,
      { angle: 0, quality: 0 }
    );

    const cos = Math.cos(bestAxis.angle);
    const sin = Math.sin(bestAxis.angle);

    return {
      // Use symmetry axis as principal axis if quality is good enough
      // Otherwise use default axes
      principalAxes: bestAxis.quality > 0.7 
        ? [[cos, -sin], [sin, cos]]
        : [[1, 0], [0, 1]],
      
      // Use uniformity as isotropy measure
      isotropy: analysis.uniformity / 100
    };
  }

  /**
   * Calculate symmetry score based on detected axes
   * @private
   */
  private calculateSymmetryScore(
    axes: Array<{ angle: number; quality: number; }>
  ): number {
    if (axes.length === 0) {
      console.log('No symmetry axes found');
      return 0;
    }

    // Calculate score based on best axes
    const bestQuality = Math.max(...axes.map(axis => axis.quality));
    const axisCount = Math.min(axes.length, 4);  // Cap at 4 axes
    
    // Score combines quality and number of axes
    const qualityScore = bestQuality * 80;  // Up to 80 points for quality
    const countScore = (axisCount / 4) * 20;  // Up to 20 points for multiple axes
    
    console.log(
      `Symmetry calculation:`,
      `\nAxes found: ${axes.length}`,
      `\nBest quality: ${bestQuality}`,
      `\nQuality score: ${qualityScore}`,
      `\nCount score: ${countScore}`,
      `\nTotal score: ${Math.round(qualityScore + countScore)}`
    );
    
    return Math.round(qualityScore + countScore);
  }

  /**
   * Calculate uniformity score based on point distribution
   * @private
   */
  private calculateUniformityScore(
    points: Point2D[],
    weights: number[]
  ): number {
    if (points.length < 2 || points.length !== weights.length) return 100;

    // Calculate weighted distances between points
    const distances: number[] = [];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const w1 = weights[i];
      if (!p1 || w1 === undefined) continue;

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const w2 = weights[j];
        if (!p2 || w2 === undefined) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const weight = (w1 + w2) / totalWeight;
        distances.push(dist * weight);
      }
    }

    if (distances.length === 0) return 100;

    // Calculate coefficient of variation (normalized standard deviation)
    const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((a, b) => a + (b - mean) ** 2, 0) / distances.length;
    const cv = Math.sqrt(variance) / mean;

    // Convert to score (lower cv means more uniform)
    const score = Math.max(0, 100 * (1 - cv / Config.symmetric.max));
    return Math.round(score);
  }
}
