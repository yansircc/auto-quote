import type { NormalizedProduct } from '../types';
import type { GeometryScoreConfig } from '../config';
import { applyNonlinearMapping } from '../utils/math';

export class EfficiencyCalculator {
  constructor(private config: GeometryScoreConfig) {}

  calculatePackingEfficiency(products: NormalizedProduct[]): number {
    if (products.length === 0) return 1;

    // 计算总体积和边界盒体积
    const totalVolume = products.reduce((sum, p) => sum + (p.volume ?? 0), 0);
    const boundingBox = this.calculateBoundingBox(products);
    const boundingBoxVolume = boundingBox.length * boundingBox.width * boundingBox.height;

    if (boundingBoxVolume === 0) return 0;

    // 计算基础效率
    const baseEfficiency = totalVolume / boundingBoxVolume;

    // 计算尺寸变化惩罚
    const dimensionVariation = this.calculateDimensionVariation(products);
    
    // 应用尺寸变化惩罚
    return baseEfficiency * (1 - dimensionVariation * 0.3); // 最多减少30%的效率
  }

  calculateBasicEfficiency(efficiency: number): number {
    return applyNonlinearMapping(efficiency, this.config.curves.basePenaltyExponent, this.config);
  }

  private calculateDimensionVariation(products: NormalizedProduct[]): number {
    if (products.length <= 1) return 0;

    // 计算每个维度的变异系数
    const dimensions = products.map(p => p.dimensions);
    const lengths = dimensions.map(d => d.length);
    const widths = dimensions.map(d => d.width);
    const heights = dimensions.map(d => d.height);

    // 计算变异系数 (标准差/平均值)
    const lengthCV = this.calculateCV(lengths);
    const widthCV = this.calculateCV(widths);
    const heightCV = this.calculateCV(heights);

    // 返回最大的变异系数，但不超过1
    return Math.min(1, Math.max(lengthCV, widthCV, heightCV));
  }

  private calculateCV(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg === 0) return 0;
    
    const variance = values.reduce((sum, val) => {
      const diff = val - avg;
      return sum + (diff * diff);
    }, 0) / values.length;
    
    const stdDev = Math.sqrt(variance);
    return stdDev / avg;
  }

  private calculateBoundingBox(products: NormalizedProduct[]): { length: number; width: number; height: number } {
    if (products.length === 0) {
      return { length: 0, width: 0, height: 0 };
    }

    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const product of products) {
      if (!product.dimensions) continue;
      maxLength = Math.max(maxLength, product.dimensions.length);
      maxWidth = Math.max(maxWidth, product.dimensions.width);
      maxHeight = Math.max(maxHeight, product.dimensions.height);
    }

    return {
      length: maxLength,
      width: maxWidth,
      height: maxHeight
    };
  }
}
