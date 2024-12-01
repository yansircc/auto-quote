import type { Point2D } from '@/types/geometry';

/**
 * Symmetry axis representation
 */
interface SymmetryAxis {
  angle: number;      // Angle in radians
  quality: number;    // Quality score (0-1)
  origin: Point2D;    // Point the axis passes through
}

/**
 * Utility class for symmetry analysis
 */
export class SymmetryAnalyzer {
  /**
   * Find potential symmetry axes for a set of points
   * @param points Array of 2D points to analyze
   * @param weights Optional weights for each point
   * @returns Array of detected symmetry axes
   */
  findSymmetryAxes(
    points: Point2D[],
    weights?: number[]
  ): SymmetryAxis[] {
    if (points.length < 2) {
      console.log('Not enough points for symmetry analysis');
      return [];
    }

    // Calculate weighted centroid
    const centroid = this.calculateWeightedCentroid(points, weights);
    console.log('Centroid:', centroid);
    
    // Get candidate angles from point pairs
    const angles = this.getCandidateAngles(points, centroid);
    console.log('Candidate angles:', angles.map(a => (a * 180 / Math.PI).toFixed(1) + '°'));
    
    // Evaluate each candidate angle
    const axes = angles.map(angle => ({
      angle,
      origin: centroid,
      quality: this.evaluateSymmetryQuality(points, weights, angle, centroid)
    }));

    // Filter out low quality axes
    const goodAxes = axes.filter(axis => axis.quality > 0.35);
    console.log(
      'Symmetry axes found:',
      goodAxes.map(a => ({
        angle: (a.angle * 180 / Math.PI).toFixed(1) + '°',
        quality: a.quality.toFixed(2)
      }))
    );

    return goodAxes;
  }

  /**
   * Calculate weighted centroid of points
   * @private
   */
  private calculateWeightedCentroid(
    points: Point2D[],
    weights?: number[]
  ): Point2D {
    const defaultWeight = 1 / points.length;
    let sumX = 0;
    let sumY = 0;
    let totalWeight = 0;

    points.forEach((point, i) => {
      const weight = weights?.[i] ?? defaultWeight;
      sumX += point.x * weight;
      sumY += point.y * weight;
      totalWeight += weight;
    });

    return {
      x: sumX / totalWeight,
      y: sumY / totalWeight
    };
  }

  /**
   * Get candidate angles for symmetry axes
   * @private
   */
  private getCandidateAngles(
    points: Point2D[],
    centroid: Point2D
  ): number[] {
    const angles = new Set<number>();
    
    if (!points || points.length === 0 || !centroid) {
      return [];
    }

    // Consider angles between each point and centroid
    points.forEach(point => {
      if (typeof point?.x !== 'number' || typeof point?.y !== 'number') {
        return;
      }

      const dx = point.x - centroid.x;
      const dy = point.y - centroid.y;
      const angle = Math.atan2(dy, dx);
      
      // Add both perpendicular and parallel angles
      angles.add(angle);
      angles.add(angle + Math.PI / 2);
    });

    // Consider angles between point pairs
    for (let i = 0; i < points.length; i++) {
      const point1 = points[i];
      if (typeof point1?.x !== 'number' || typeof point1?.y !== 'number') {
        continue;
      }

      for (let j = i + 1; j < points.length; j++) {
        const point2 = points[j];
        if (typeof point2?.x !== 'number' || typeof point2?.y !== 'number') {
          continue;
        }

        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const angle = Math.atan2(dy, dx);
        angles.add(angle);
      }
    }

    return Array.from(angles);
  }

  /**
   * Evaluate symmetry quality for a given axis
   * @private
   */
  private evaluateSymmetryQuality(
    points: Point2D[],
    weights: number[] | undefined,
    angle: number,
    origin: Point2D
  ): number {
    if (points.length === 0) return 0;

    const defaultWeight = 1 / points.length;
    let totalQuality = 0;
    let totalWeight = 0;

    // For each point, find closest reflected point
    points.forEach((point, i) => {
      const weight = weights?.[i] ?? defaultWeight;
      const reflected = this.reflectPoint(point, angle, origin);

      // Find closest point to reflection
      let minDistance = Infinity;
      points.forEach((other, j) => {
        if (i !== j) {  // Don't compare with self
          const dist = this.pointDistance(reflected, other);
          minDistance = Math.min(minDistance, dist);
        }
      });

      // Convert distance to quality score (0-1)
      // Use exponential decay for smoother scoring
      const quality = Math.exp(-minDistance / 100);  // Increase decay factor from 50 to 100 for more leniency
      totalQuality += quality * weight;
      totalWeight += weight;
    });

    const avgQuality = totalQuality / totalWeight;
    console.log(
      `Quality for angle ${(angle * 180 / Math.PI).toFixed(1)}°:`,
      `\nTotal quality: ${totalQuality.toFixed(2)}`,
      `\nTotal weight: ${totalWeight.toFixed(2)}`,
      `\nAverage quality: ${avgQuality.toFixed(2)}`
    );

    return avgQuality;
  }

  /**
   * Reflect a point across an axis
   * @private
   */
  private reflectPoint(
    point: Point2D,
    angle: number,
    origin: Point2D
  ): Point2D {
    // Translate to origin
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    
    // Rotate to align axis with x-axis
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    
    // Reflect across x-axis
    const reflectedRy = -ry;
    
    // Rotate back and translate
    return {
      x: rx * cos - reflectedRy * sin + origin.x,
      y: rx * sin + reflectedRy * cos + origin.y
    };
  }

  /**
   * Calculate distance between two points
   * @private
   */
  private pointDistance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}