import type { Product, Point3D } from '@/types/geometry';

interface ProductGeneratorConfig {
  // 尺寸范围配置 (mm)
  dimensions: {
    minLength: number;
    maxLength: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
  // 重量范围配置 (g)
  weight: {
    min: number;
    max: number;
  };
  // 体积密度范围 (g/cm³)
  density: {
    min: number;
    max: number;
  };
}

// 默认产品生成配置
// Default configuration for reasonable product dimensions and properties
const DEFAULT_CONFIG: ProductGeneratorConfig = {
  dimensions: {
    minLength: 20,   // 最小长度 20mm
    maxLength: 200,  // 最大长度 200mm
    minWidth: 20,    // 最小宽度 20mm
    maxWidth: 200,   // 最大宽度 200mm
    minHeight: 10,   // 最小高度 10mm
    maxHeight: 100,  // 最大高度 100mm
  },
  weight: {
    min: 50,     // 最小重量 50g
    max: 1000,   // 最大重量 1000g
  },
  density: {
    min: 0.9,    // 最小密度 0.9 g/cm³ (接近 PP)
    max: 1.4,    // 最大密度 1.4 g/cm³ (接近 PET)
  }
};

// 生成随机数的辅助函数
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成合理的体积和表面积
function generateVolumeAndSurface(length: number, width: number, height: number) {
  const volume = length * width * height;
  // 简化的表面积计算 (长方体)
  const surfaceArea = 2 * (length * width + length * height + width * height);
  return { volume, surfaceArea };
}

// 生成边界盒和质心
function generateBoundingBoxAndCenterOfMass(length: number, width: number, height: number): {
  boundingBox: { min: Point3D; max: Point3D; dimensions: Point3D };
  centerOfMass: Point3D;
} {
  return {
    boundingBox: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: length, y: width, z: height },
      dimensions: { x: length, y: width, z: height }
    },
    centerOfMass: {
      x: length / 2,
      y: width / 2,
      z: height / 2
    }
  };
}

/**
 * Generate a random product with reasonable properties
 * 生成具有合理属性的随机产品
 */
export function generateRandomProduct(id: number, config: Partial<ProductGeneratorConfig> = {}): Product {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Generate dimensions
  const length = randomInRange(finalConfig.dimensions.minLength, finalConfig.dimensions.maxLength);
  const width = randomInRange(finalConfig.dimensions.minWidth, finalConfig.dimensions.maxWidth);
  const height = randomInRange(finalConfig.dimensions.minHeight, finalConfig.dimensions.maxHeight);
  
  // Calculate volume and surface area
  const { volume, surfaceArea } = generateVolumeAndSurface(length, width, height);
  
  // Generate weight based on volume and density range
  const volumeInCm3 = volume / 1000; // convert mm³ to cm³
  const density = randomInRange(
    finalConfig.density.min * 100,
    finalConfig.density.max * 100
  ) / 100;
  const weight = Math.round(volumeInCm3 * density);
  
  // Generate bounding box and center of mass
  const { boundingBox, centerOfMass } = generateBoundingBoxAndCenterOfMass(length, width, height);

  return {
    id,
    weight,
    dimensions: {
      length,
      width,
      height
    },
    cadData: {
      volume,
      surfaceArea,
      boundingBox,
      centerOfMass
    }
  };
}

/**
 * Generate multiple random products
 * 生成多个随机产品
 */
export function generateRandomProducts(count: number, config?: Partial<ProductGeneratorConfig>): Product[] {
  return Array.from({ length: count }, (_, i) => generateRandomProduct(i + 1, config));
}
