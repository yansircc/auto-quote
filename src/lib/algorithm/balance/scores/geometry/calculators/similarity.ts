import type { GeometryScoreConfig } from '../config';
import type { ShapeFeatures, DimensionFeatures } from '../types';
import { areNumbersEqual, applyNonlinearMapping } from '../utils/math';

export class SimilarityCalculator {
  constructor(private config: GeometryScoreConfig) {}

  /**
   * 计算形状相似度分数
   * @param similarities 相似度矩阵
   * @returns 0-1之间的分数
   */
  calculateShapeScore(similarities: number[][]): number {
    const avgSimilarity = this.calculateMatrixAverage(similarities);
    return applyNonlinearMapping(avgSimilarity, this.config.curves.basePenaltyExponent, this.config);
  }

  /**
   * 计算尺寸相似度分数
   * @param similarities 相似度矩阵
   * @returns 0-1之间的分数
   */
  calculateDimensionScore(similarities: number[][]): number {
    const avgSimilarity = this.calculateMatrixAverage(similarities);
    return applyNonlinearMapping(avgSimilarity, this.config.curves.basePenaltyExponent, this.config);
  }

  /**
   * 计算两个特征之间的形状相似度
   * @param a 第一个形状特征
   * @param b 第二个形状特征
   * @returns 0-1之间的相似度值
   */
  compareShapeFeatures(a: ShapeFeatures, b: ShapeFeatures): number {
    // 计算各个维度的相似度
    const aspectRatioSimilarity = this.calculateRatioSimilarity(a.aspectRatio, b.aspectRatio);
    const volumeSimilarity = this.calculateRatioSimilarity(a.volume, b.volume);
    const areaSimilarity = this.calculateRatioSimilarity(a.surfaceArea, b.surfaceArea);

    // 使用配置的权重计算加权平均
    const { aspectRatioWeight, shapeWeight } = this.config.similarity;
    const remainingWeight = 1 - aspectRatioWeight - shapeWeight;

    const score = (
      aspectRatioSimilarity * aspectRatioWeight +
      volumeSimilarity * shapeWeight +
      areaSimilarity * remainingWeight
    );

    return score;
  }

  /**
   * 计算两个特征之间的尺寸相似度
   * @param a 第一个尺寸特征
   * @param b 第二个尺寸特征
   * @returns 0-1之间的相似度值
   */
  compareDimensionFeatures(a: DimensionFeatures, b: DimensionFeatures): number {
    // 计算比例相似度
    const ratioSimilarities = [
      this.calculateRatioSimilarity(a.ratios.lengthWidth, b.ratios.lengthWidth),
      this.calculateRatioSimilarity(a.ratios.lengthHeight, b.ratios.lengthHeight),
      this.calculateRatioSimilarity(a.ratios.widthHeight, b.ratios.widthHeight)
    ];
    const ratioScore = ratioSimilarities.reduce((sum, val) => sum + val, 0) / ratioSimilarities.length;

    // 计算尺寸比例（等比例缩放）
    const scaleFactor = Math.min(
      a.length / b.length,
      a.width / b.width,
      a.height / b.height
    );
    
    // 检查是否为等比例缩放
    const isProportional = 
      areNumbersEqual(a.length / b.length, scaleFactor, this.config.tolerance) &&
      areNumbersEqual(a.width / b.width, scaleFactor, this.config.tolerance) &&
      areNumbersEqual(a.height / b.height, scaleFactor, this.config.tolerance);

    // 如果是等比例缩放，给予高分
    const scaleScore = isProportional ? 1 : 0.3;

    // 使用配置的权重计算加权平均
    const { dimensionWeight } = this.config.similarity;
    const score = ratioScore * (1 - dimensionWeight) + scaleScore * dimensionWeight;

    return score;
  }

  /**
   * 计算相似度矩阵的平均值
   * @param similarities 相似度矩阵
   * @returns 0-1之间的平均相似度值
   */
  private calculateMatrixAverage(similarities: number[][]): number {
    // 1. 基本验证
    if (!Array.isArray(similarities) || similarities.length === 0) {
      return 1;
    }

    // 2. 计算有效的相似度值
    let sum = 0;
    let count = 0;

    // 只计算上三角矩阵的平均值（不包括对角线）
    for (let i = 0; i < similarities.length; i++) {
      // 确保 similarities[i] 存在且是数组
      const row = similarities[i];
      if (!Array.isArray(row)) continue;

      for (let j = i + 1; j < row.length; j++) {
        // 确保 similarities[i][j] 是有效的数字
        const similarity = row[j];
        if (typeof similarity !== 'number' || isNaN(similarity)) continue;

        sum += similarity;
        count++;
      }
    }

    // 3. 返回平均值，如果没有有效值则返回1
    return count === 0 ? 1 : sum / count;
  }

  /**
   * 计算两个数值的比率相似度
   * @param a 第一个数值
   * @param b 第二个数值
   * @returns 0-1之间的相似度值
   */
  private calculateRatioSimilarity(a: number, b: number): number {
    // 处理边界情况
    if (areNumbersEqual(a, b, this.config.tolerance)) return 1;
    if (a <= 0 || b <= 0) return 0;

    // 计算比率
    const ratio = Math.min(a, b) / Math.max(a, b);
    
    // 使用配置的阈值处理接近完美的情况
    if (ratio > this.config.curves.nearPerfectThreshold) {
      const threshold = this.config.curves.nearPerfectThreshold;
      return threshold + (ratio - threshold) * 10;
    }
    
    // 使用配置的参数进行S型曲线映射
    const { midPointRatio, slopeFactor, basePenaltyExponent } = this.config.curves;
    const x = (ratio - midPointRatio) * slopeFactor;
    const base = 1 / (1 + Math.exp(-x));
    
    // 使用配置的惩罚指数
    return Math.pow(base, basePenaltyExponent);
  }
}
