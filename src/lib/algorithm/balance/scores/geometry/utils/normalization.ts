import type { Product } from '@/types/geometry';
import type { NormalizedProduct } from '../types';
import type { GeometryScoreConfig } from '../config';

export class DataNormalizer {
  constructor(private config: GeometryScoreConfig) {}

  private normalizeDimension(value: number): number {
    // 对极端值使用对数归一化
    if (value <= this.config.tolerance.minimum) {
      return this.config.tolerance.minimum;
    }
    
    if (value > 1000000) {
      // 使用对数尺度处理大值
      return Math.log10(value) / Math.log10(1000000);
    }
    
    // 正常范围内的值线性归一化
    return value;
  }

  normalizeProduct(product: Product): NormalizedProduct {
    const { dimensions, cadData } = product;
    if (!dimensions || !cadData) {
      throw new Error('Missing required product data');
    }

    // 对维度进行归一化
    const normalizedDimensions = {
      length: this.normalizeDimension(dimensions.length),
      width: this.normalizeDimension(dimensions.width),
      height: this.normalizeDimension(dimensions.height)
    };

    // 对体积和表面积使用对数归一化
    const normalizedVolume = this.normalizeDimension(cadData.volume);
    const normalizedSurfaceArea = this.normalizeDimension(cadData.surfaceArea);

    return {
      dimensions: normalizedDimensions,
      volume: normalizedVolume,
      surfaceArea: normalizedSurfaceArea
    };
  }
}

// 批量规范化
export function normalizeProducts(
  products: Product[],
  config: GeometryScoreConfig
): NormalizedProduct[] {
  const normalizer = new DataNormalizer(config);
  return products.map(p => normalizer.normalizeProduct(p));
}
