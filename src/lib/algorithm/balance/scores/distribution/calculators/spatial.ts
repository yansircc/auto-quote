import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import type { Bounds2D } from "@/types/core/geometry";
import type { DetailedDistributionScore } from "@/types/algorithm/balance/types";

interface SpatialCalculatorConfig {
  gridSize: number;
  maxUniformity: number;
  minDensity: number;
  weights: {
    uniformity: number;
    density: number;
  };
}

const DEFAULT_CONFIG: SpatialCalculatorConfig = {
  gridSize: 10,
  maxUniformity: 100,
  minDensity: 0.1,
  weights: {
    uniformity: 0.6,
    density: 0.4,
  },
};

interface SpatialAnalysisResult {
  uniformity: number;
  density: number;
  gridCells: number;
  occupiedCells: number;
}

export class SpatialCalculator {
  private config: SpatialCalculatorConfig;

  constructor(config?: Partial<SpatialCalculatorConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      weights: {
        ...DEFAULT_CONFIG.weights,
        ...config?.weights,
      },
    };
  }

  /**
   * 计算空间分布分数
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): SpatialAnalysisResult {
    // 空布局或单个产品的情况
    if (products.length <= 1) {
      return {
        uniformity: 100,
        density: 100,
        gridCells: 1,
        occupiedCells: products.length,
      };
    }

    // 计算布局边界
    const bounds = this.getLayoutBounds(layout);
    if (!bounds) {
      return {
        uniformity: 0,
        density: 0,
        gridCells: 0,
        occupiedCells: 0,
      };
    }

    // 创建网格
    const grid = this.createGrid(bounds, this.config.gridSize);

    // 计算每个产品在网格中的占用情况
    let occupiedCells = 0;
    products.forEach((product) => {
      const rect = layout[product.id];
      if (!rect) return;

      const cells = this.getCellsForRect(rect, grid);
      occupiedCells += cells.length;
    });

    // 计算密度
    const totalCells = grid.length * (grid[0]?.length ?? 0);
    const density = occupiedCells / totalCells;
    const normalizedDensity = Math.min(
      100,
      (density / this.config.minDensity) * 100,
    );

    // 计算均匀度
    const uniformity = this.calculateUniformity(layout, products, grid);
    const normalizedUniformity = Math.min(
      100,
      (uniformity / this.config.maxUniformity) * 100,
    );

    return {
      uniformity: normalizedUniformity,
      density: normalizedDensity,
      gridCells: totalCells,
      occupiedCells,
    };
  }

  /**
   * 计算均匀度
   */
  private calculateUniformity(
    layout: Record<number, Rectangle>,
    products: Product[],
    grid: boolean[][],
  ): number {
    // 计算每个网格单元的占用密度
    const densities: number[] = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < (grid[i]?.length ?? 0); j++) {
        if (grid[i]?.[j]) {
          const density = this.calculateCellDensity(i, j, layout, products);
          densities.push(density);
        }
      }
    }

    if (densities.length === 0) return 0;

    // 计算密度的标准差
    const mean = densities.reduce((sum, d) => sum + d, 0) / densities.length;
    const variance =
      densities.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
      densities.length;
    const stdDev = Math.sqrt(variance);

    // 将标准差转换为均匀度分数
    return Math.max(0, 100 - (stdDev / mean) * 100);
  }

  /**
   * 计算单个网格单元的密度
   */
  private calculateCellDensity(
    row: number,
    col: number,
    layout: Record<number, Rectangle>,
    products: Product[],
  ): number {
    let totalArea = 0;
    let occupiedArea = 0;

    products.forEach((product) => {
      const rect = layout[product.id];
      if (!rect) return;

      // 计算矩形与网格单元的重叠面积
      const overlap = this.calculateOverlap(rect, row, col);
      if (overlap > 0) {
        occupiedArea += overlap;
      }
      totalArea += rect.width * rect.length;
    });

    return totalArea > 0 ? occupiedArea / totalArea : 0;
  }

  /**
   * 计算矩形与网格单元的重叠面积
   */
  private calculateOverlap(rect: Rectangle, row: number, col: number): number {
    const cellSize = this.config.gridSize;
    const cellX = col * cellSize;
    const cellY = row * cellSize;

    const overlapX = Math.max(
      0,
      Math.min(rect.x + rect.width, cellX + cellSize) - Math.max(rect.x, cellX),
    );
    const overlapY = Math.max(
      0,
      Math.min(rect.y + rect.length, cellY + cellSize) -
        Math.max(rect.y, cellY),
    );

    return overlapX * overlapY;
  }

  /**
   * 获取矩形覆盖的网格单元
   */
  private getCellsForRect(
    rect: Rectangle,
    grid: boolean[][],
  ): [number, number][] {
    const cells: [number, number][] = [];
    const cellSize = this.config.gridSize;

    const startRow = Math.floor(rect.y / cellSize);
    const endRow = Math.floor((rect.y + rect.length) / cellSize);
    const startCol = Math.floor(rect.x / cellSize);
    const endCol = Math.floor((rect.x + rect.width) / cellSize);

    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        if (i >= 0 && i < grid.length && j >= 0 && j < (grid[i]?.length ?? 0)) {
          cells.push([i, j]);
          grid[i]![j] = true;
        }
      }
    }

    return cells;
  }

  /**
   * 创建网格
   */
  private createGrid(bounds: Bounds2D, cellSize: number): boolean[][] {
    const rows = Math.ceil((bounds.maxY - bounds.minY) / cellSize);
    const cols = Math.ceil((bounds.maxX - bounds.minX) / cellSize);

    return Array.from<unknown, boolean[]>({ length: rows }, () =>
      Array.from<unknown, boolean>({ length: cols }, () => false),
    );
  }

  /**
   * 获取布局边界
   */
  private getLayoutBounds(layout: Record<number, Rectangle>): Bounds2D | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const rectangles = Object.values(layout);
    if (rectangles.length === 0) {
      return null;
    }

    for (const rect of rectangles) {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.length);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 将分析结果转换为详细分数
   */
  toScoreDetails(
    analysis: SpatialAnalysisResult,
  ): Partial<DetailedDistributionScore["details"]["volumeBalance"]> {
    return {
      densityVariance: analysis.density,
      symmetry: analysis.uniformity,
    };
  }
}
