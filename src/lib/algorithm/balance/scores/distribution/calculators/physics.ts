import type { Rectangle, Product } from '@/types/geometry';
import type { DetailedDistributionScore } from '@/types/balance';
import type { InternalPhysicalAnalysis } from '../types';
import {
  calculateRectangleInertia,
  calculatePrincipalComponents,
  calculateGyrationRadius,
  calculateCenterOfMass,
  calculateMassDistribution
} from '../utils/inertia';

/**
 * Calculator for physical properties of the layout
 * Handles mass distribution, inertia tensor, and related calculations
 */
export class PhysicsCalculator {
  /**
   * Calculate physical properties of the layout
   * @param layout Map of rectangles representing product positions
   * @param products Array of products with their properties
   * @returns Physical analysis results
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): InternalPhysicalAnalysis {
    // Convert layout to mass elements
    const massElements = this.createMassElements(layout, products);
    
    // Calculate center of mass
    const centerOfMass = calculateCenterOfMass(massElements);
    
    // Calculate total mass and distribution
    const totalMass = massElements.reduce((sum, el) => sum + el.mass, 0);
    const distribution = calculateMassDistribution(massElements, centerOfMass);

    // Calculate system inertia tensor
    const [Ixx, Iyy, Ixy] = this.calculateSystemInertia(massElements);
    
    // Calculate principal components
    const { moments, axes } = calculatePrincipalComponents(Ixx, Iyy, Ixy);
    
    // Calculate gyration radius
    const gyrationRadius = calculateGyrationRadius(moments, totalMass);

    return {
      mass: {
        total: totalMass,
        center: centerOfMass,
        distribution
      },
      inertia: {
        tensor: [Ixx, Iyy, Ixy],
        principal: {
          moments,
          axes
        },
        gyrationRadius
      }
    };
  }

  /**
   * Convert physical analysis to distribution score details
   * @param analysis Physical analysis results
   * @returns Distribution score details
   */
  public toScoreDetails(analysis: InternalPhysicalAnalysis): DetailedDistributionScore['details'] {
    return {
      principalMoments: analysis.inertia.principal.moments,
      principalAxes: analysis.inertia.principal.axes,
      gyrationRadius: analysis.inertia.gyrationRadius,
      isotropy: this.calculateIsotropy(analysis.inertia.principal.moments),
      centerDeviation: this.calculateCenterDeviation(analysis.mass.distribution),
      volumeBalance: {
        densityVariance: 0,
        heightBalance: 0,
        massDistribution: 0
      }
    };
  }

  /**
   * Calculate isotropy from principal moments
   * @private
   */
  private calculateIsotropy(moments: [number, number]): number {
    const [I1, I2] = moments;
    // Isotropy is ratio of smaller to larger moment
    return Math.min(I1, I2) / Math.max(I1, I2);
  }

  /**
   * Calculate center deviation from mass distribution
   * @private
   */
  private calculateCenterDeviation(distribution: number[]): number {
    if (distribution.length === 0) return 0;
    // Use standard deviation of distances from center
    const mean = distribution.reduce((a, b) => a + b, 0) / distribution.length;
    const variance = distribution.reduce((a, b) => a + (b - mean) ** 2, 0) / distribution.length;
    return Math.sqrt(variance);
  }

  /**
   * Create mass elements from layout and products
   * @private
   */
  private createMassElements(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    mass: number;
  }> {
    return products.map(product => {
      const rect = layout[product.id];
      if (!rect) {
        throw new Error(`Layout position not found for product ${product.id}`);
      }

      // Use actual product weight if available, otherwise approximate by volume
      const mass = product.weight ?? (
        product.dimensions ? 
        product.dimensions.width * 
        product.dimensions.length * 
        product.dimensions.height : 1
      );
      
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        width: rect.width,
        height: rect.height,
        mass
      };
    });
  }

  /**
   * Calculate system inertia tensor
   * @private
   */
  private calculateSystemInertia(
    elements: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      mass: number;
    }>
  ): [number, number, number] {
    // Sum up individual inertia tensors
    return elements.reduce(
      (total, element) => {
        const [Ixx, Iyy, Ixy] = calculateRectangleInertia(
          element.x,
          element.y,
          element.width,
          element.height,
          element.mass
        );
        return [
          total[0] + Ixx,
          total[1] + Iyy,
          total[2] + Ixy
        ];
      },
      [0, 0, 0] as [number, number, number]
    );
  }
}
