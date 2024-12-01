import type { Rectangle, Product } from '@/types/geometry';
import { DistributionBalanceConfig as Config } from '../config';

/**
 * Calculator for volume distribution analysis
 * Analyzes height and density distribution in a 2D layout
 */
export class VolumeCalculator {
  /**
   * Calculate volume distribution score and details
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): {
    score: number;
    details: {
      densityVariance: number;
      heightBalance: number;
      massDistribution: number;
    };
  } {
    if (products.length === 0) {
      return {
        score: 100,
        details: {
          densityVariance: 0,
          heightBalance: 1,
          massDistribution: 1
        }
      };
    }

    const bounds = this.getLayoutBounds(layout);
    if (!bounds) {
      return {
        score: 0,
        details: {
          densityVariance: 1,
          heightBalance: 0,
          massDistribution: 0
        }
      };
    }

    // Calculate density variance (40%)
    const densityScore = this.calculateDensityVariance(layout, products, bounds);
    
    // Calculate height balance (30%)
    const heightScore = this.calculateHeightBalance(layout, products);
    
    // Calculate mass distribution (30%)
    const massScore = this.calculateMassDistribution(layout, products);

    // Combine scores with weights
    const score = Math.round(
      (densityScore / 100) * 0.4 +
      (heightScore / 100) * 0.3 +
      (massScore / 100) * 0.3
    ) * 100;

    return {
      score,
      details: {
        densityVariance: 1 - (densityScore / 100),  // Convert to variance
        heightBalance: heightScore / 100,
        massDistribution: massScore / 100
      }
    };
  }

  /**
   * Calculate density variance score
   * Uses a grid-based approach to evaluate space utilization
   * @private
   */
  private calculateDensityVariance(
    layout: Record<number, Rectangle>,
    products: Product[],
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): number {
    const grid = this.createDensityGrid(layout, products, bounds, Config.gridSize);
    
    // Calculate mean density of non-empty cells only
    let sum = 0;
    let count = 0;
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell > 0) {
          sum += cell;
          count++;
        }
      });
    });

    // Handle edge case of empty grid
    if (count === 0) return 100;
    
    const mean = sum / count;

    // Calculate variance using only non-empty cells
    let variance = 0;
    let maxVariance = 0;
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell > 0) {
          const diff = Math.abs(cell - mean);
          variance += diff * diff;
          maxVariance = Math.max(maxVariance, diff);
        }
      });
    });

    // Normalize variance and convert to score
    variance = Math.sqrt(variance / count) / mean;
    
    // More forgiving scoring curve
    const normalizedScore = Math.max(0, 100 * (1 - variance / Config.maxDensityVariance));
    return Math.min(100, normalizedScore + 20); // Add bonus points for having any distribution
  }

  /**
   * Calculate height balance score
   * Evaluates the distribution of product heights
   * @private
   */
  private calculateHeightBalance(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number {
    if (products.length === 0) return 100;
    if (products.length === 1) return 90; // Single product is reasonably balanced

    // Calculate height variations with type safety
    const heights = products
      .map(p => p.dimensions?.height ?? 0)
      .filter(h => h > 0);  // 过滤掉无效高度
    
    if (heights.length === 0) return 100;  // 如果没有有效高度，返回满分
    
    const meanHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
    
    let maxDeviation = 0;
    heights.forEach(h => {
      const deviation = Math.abs(h - meanHeight);
      maxDeviation = Math.max(maxDeviation, deviation);
    });

    // More forgiving scoring curve for height balance
    const score = Math.max(0, 100 * (1 - maxDeviation / Config.maxHeightDeviation));
    return score;  // Remove bonus points
  }

  /**
   * Calculate mass distribution score
   * Evaluates the distribution of product masses (volume-based)
   * @private
   */
  private calculateMassDistribution(
    layout: Record<number, Rectangle>,
    products: Product[]
  ): number {
    if (products.length === 0) return 100;
    if (products.length === 1) return 90; // Single product is reasonably distributed

    // Calculate center of mass with type safety
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

    if (totalMass === 0) return 100;

    centerX /= totalMass;
    centerY /= totalMass;

    // Calculate weighted radius of gyration with type safety
    let totalRadius = 0;
    let validProducts = 0;
    products.forEach((product, i) => {
      const rect = layout[i];
      if (!rect || !product.dimensions) return;
      
      const mass = product.weight || 1;
      const dx = rect.x - centerX;
      const dy = rect.y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      
      // Use mass-weighted radius
      totalRadius += radius * mass;
      validProducts++;
    });

    if (validProducts === 0) return 100;

    // Calculate average radius
    const avgRadius = totalRadius / (totalMass * validProducts);
    
    // Use a more forgiving scoring curve with diminishing penalties
    const normalizedRadius = avgRadius / Config.maxInertiaRadius;
    const score = 100 * Math.exp(-normalizedRadius * 0.8); // 减小衰减系数，使分数更高
    
    // Add bonus for multiple products and good distribution
    const distributionBonus = Math.min(35, validProducts * 8); // 增加奖励
    return Math.min(100, score + distributionBonus);
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
}
