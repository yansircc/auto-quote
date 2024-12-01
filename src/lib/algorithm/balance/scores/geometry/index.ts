import type { GeometryScore } from '@/types/balance';
import type { GeometryScoreConfig } from './config';
import type { NormalizedProduct } from './types'; 
import type { DimensionFeatures } from './types'; 
import type { ShapeFeatures } from './types'; 

import { defaultConfig } from './config';
import { ProductValidator } from './validators/product';
import { DataNormalizer } from './utils/normalization';
import { SimilarityCalculator } from './calculators/similarity';
import { EfficiencyCalculator } from './calculators/efficiency';
import { validateWeights } from './utils/math';

export class GeometryScorer {
  private validator: ProductValidator;
  private normalizer: DataNormalizer;
  private similarityCalculator: SimilarityCalculator;
  private efficiencyCalculator: EfficiencyCalculator;

  constructor(private config: GeometryScoreConfig = defaultConfig) {
    // 验证配置
    if (!validateWeights(config.similarity)) {
      throw new Error('Invalid weights configuration: sum must be 1');
    }

    // 验证容差值
    if (config.tolerance.ratio < 0 || config.tolerance.minimum < 0) {
      throw new Error('Invalid tolerance configuration: values must be non-negative');
    }

    this.validator = new ProductValidator(config);
    this.normalizer = new DataNormalizer(config);
    this.similarityCalculator = new SimilarityCalculator(config);
    this.efficiencyCalculator = new EfficiencyCalculator(config);
  }

  calculateScore(products: NormalizedProduct[]): GeometryScore {
    // 1. 特殊情况处理
    if (products.length === 0) {
      return {
        score: 0,
        details: {
          shapeScore: {
            aspectRatio: 0,
            symmetry: 0,
            complexity: 0,
            uniformity: 0
          },
          dimensionScore: {
            sizeVariation: 0,
            scaleRatio: 0,
            consistency: 0
          },
          similarityScore: {
            shapeHomogeneity: 0,
            dimensionHomogeneity: 0
          },
          efficiencyScore: {
            packingDensity: 0,
            boundingBoxEfficiency: 0
          }
        }
      };
    }

    // 2. 验证产品有效性
    const invalidProducts = products.filter(p => {
      const { length, width, height } = p.dimensions;
      return !length || !width || !height || !p.volume || p.volume <= 0;
    });

    if (invalidProducts.length > 0) {
      return {
        score: 30, // 给一个较低的分数
        details: {
          shapeScore: {
            aspectRatio: 30,
            symmetry: 30,
            complexity: 30,
            uniformity: 30
          },
          dimensionScore: {
            sizeVariation: 30,
            scaleRatio: 30,
            consistency: 30
          },
          similarityScore: {
            shapeHomogeneity: 30,
            dimensionHomogeneity: 30
          },
          efficiencyScore: {
            packingDensity: 30,
            boundingBoxEfficiency: 30
          }
        }
      };
    }

    // 3. 单个有效产品返回满分
    if (products.length === 1 || this.areAllProductsIdentical(products)) {
      return this.createPerfectScore();
    }

    // 5. 计算相似度矩阵
    const shapeSimilarities = this.calculateShapeSimilarityMatrix(products);
    const dimensionSimilarities = this.calculateDimensionSimilarityMatrix(products);

    // 6. 计算效率
    const efficiency = this.efficiencyCalculator.calculatePackingEfficiency(products);

    // 7. 计算各个维度的分数
    const shapeScore = this.similarityCalculator.calculateShapeScore(shapeSimilarities);
    const dimensionScore = this.similarityCalculator.calculateDimensionScore(dimensionSimilarities);
    const similarityScore = {
      shapeHomogeneity: this.convertToPercentage(shapeScore),
      dimensionHomogeneity: this.convertToPercentage(dimensionScore)
    };
    const efficiencyScore = {
      packingDensity: this.convertToPercentage(efficiency),
      boundingBoxEfficiency: this.convertToPercentage(this.efficiencyCalculator.calculateBasicEfficiency(efficiency))
    };

    // 8. 计算总分
    const score = this.calculateOverallScore({
      shapeScore,
      dimensionScore,
      similarityScore,
      efficiencyScore
    });

    return {
      score: this.convertToPercentage(score),
      details: {
        shapeScore: {
          aspectRatio: this.convertToPercentage(shapeScore),
          symmetry: this.convertToPercentage(shapeScore),
          complexity: this.convertToPercentage(shapeScore),
          uniformity: this.convertToPercentage(shapeScore)
        },
        dimensionScore: {
          sizeVariation: this.convertToPercentage(dimensionScore),
          scaleRatio: this.convertToPercentage(dimensionScore),
          consistency: this.convertToPercentage(dimensionScore)
        },
        similarityScore,
        efficiencyScore
      }
    };
  }

  private areAllProductsIdentical(products: NormalizedProduct[]): boolean {
    if (products.length <= 1) return true;
    
    const first = products[0];
    if (!first) return false;
    
    // 确保所有必要的属性都存在
    if (!first.dimensions || !first.volume) return false;
    
    const { dimensions: firstDims, volume: firstVolume, surfaceArea: firstSurfaceArea } = first;
    
    return products.every(p => {
      if (!p?.dimensions || !p.volume) return false;
      
      return (
        Math.abs(p.dimensions.length - firstDims.length) < this.config.tolerance.minimum &&
        Math.abs(p.dimensions.width - firstDims.width) < this.config.tolerance.minimum &&
        Math.abs(p.dimensions.height - firstDims.height) < this.config.tolerance.minimum &&
        Math.abs(p.volume - firstVolume) < this.config.tolerance.minimum &&
        Math.abs(p.surfaceArea - firstSurfaceArea) < this.config.tolerance.minimum
      );
    });
  }

  private calculateShapeSimilarityMatrix(products: NormalizedProduct[]): number[][] {
    // 使用类型安全的方式初始化矩阵
    const matrix: number[][] = Array.from({ length: products.length }, 
        () => Array.from({ length: products.length }, () => 0)
    );
    
    for (let i = 0; i < products.length; i++) {
      const row = matrix[i];
      if (!row) continue;  // 类型保护
      
      for (let j = 0; j < products.length; j++) {
        if (i === j) {
          row[j] = 1;
        } else if (i < j) {
          const p1 = products[i];
          const p2 = products[j];
          
          const similarity = this.similarityCalculator.compareShapeFeatures(
            this.toShapeFeatures(p1),
            this.toShapeFeatures(p2)
          );
          row[j] = similarity ?? 0;
        } else {
          const sourceRow = matrix[j];
          if (!sourceRow) continue;  // 类型保护
          row[j] = sourceRow[i] ?? 0;  // 添加空值合并运算符
        }
      }
    }
    return matrix;
  }

  private toShapeFeatures(product: NormalizedProduct | undefined): ShapeFeatures {
    const { length, width, height } = product?.dimensions ?? {};
    const aspectRatio = (length ?? 0) / (width ?? 0) / (height ?? 0);
    return {
      volume: product?.volume ?? 0,
      surfaceArea: product?.surfaceArea ?? 0,
      aspectRatio: aspectRatio
    };
  }

  private calculateDimensionSimilarityMatrix(products: NormalizedProduct[]): number[][] {
    // 使用类型安全的方式初始化矩阵
    const matrix: number[][] = Array.from({ length: products.length }, 
        () => Array.from({ length: products.length }, () => 0)
    );
    
    for (let i = 0; i < products.length; i++) {
      const row = matrix[i];
      if (!row) continue;  // 类型保护
      
      for (let j = 0; j < products.length; j++) {
        if (i === j) {
          row[j] = 1;
        } else if (i < j) {
          const p1 = products[i];
          const p2 = products[j];
          if (!p1 || !p2) {
            row[j] = 0;  // Handle undefined products
          } else {
            const similarity = this.similarityCalculator.compareDimensionFeatures(
              this.toDimensionFeatures(p1),
              this.toDimensionFeatures(p2)
            );
            row[j] = similarity ?? 0;
          }
        } else {
          const sourceRow = matrix[j];
          if (!sourceRow) continue;  // 类型保护
          row[j] = sourceRow[i] ?? 0;  // 添加空值合并运算符
        }
      }
    }
    return matrix;
  }

  private toDimensionFeatures(product: NormalizedProduct): DimensionFeatures {
    const { length, width, height } = product.dimensions;
    return {
      length,
      width,
      height,
      ratios: {
        lengthWidth: length / width,
        lengthHeight: length / height,
        widthHeight: width / height
      }
    };
  }

  private calculateOverallScore(scores: {
    shapeScore: number;
    dimensionScore: number;
    similarityScore: {
      shapeHomogeneity: number;
      dimensionHomogeneity: number;
    };
    efficiencyScore: {
      packingDensity: number;
      boundingBoxEfficiency: number;
    };
  }): number {
    const { similarity } = this.config;
    
    // 计算加权总分
    const weightedScore = 
      scores.shapeScore * similarity.shapeWeight +
      scores.dimensionScore * similarity.dimensionWeight +
      ((scores.similarityScore.shapeHomogeneity + scores.similarityScore.dimensionHomogeneity) / 2) * similarity.aspectRatioWeight +
      ((scores.efficiencyScore.packingDensity + scores.efficiencyScore.boundingBoxEfficiency) / 2) * 
      (1 - similarity.shapeWeight - similarity.dimensionWeight - similarity.aspectRatioWeight);

    // 确保分数在0-100范围内
    return Math.min(100, Math.max(0, weightedScore));
  }

  private createPerfectScore(): GeometryScore {
    return {
      score: 100,
      details: {
        shapeScore: {
          aspectRatio: 100,
          symmetry: 100,
          complexity: 100,
          uniformity: 100
        },
        dimensionScore: {
          sizeVariation: 100,
          scaleRatio: 100,
          consistency: 100
        },
        similarityScore: {
          shapeHomogeneity: 100,
          dimensionHomogeneity: 100
        },
        efficiencyScore: {
          packingDensity: 100,
          boundingBoxEfficiency: 100
        }
      }
    };
  }

  private convertToPercentage(score: number): number {
    return Math.round(score * 100);
  }
}

// 导出默认的评分器实例
export const geometryScorer = new GeometryScorer(defaultConfig);

// 导出便捷的评分函数
export function calculateGeometryScore(products: NormalizedProduct[]): GeometryScore {
  return geometryScorer.calculateScore(products);
}