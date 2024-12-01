import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import type { DetailedDistributionScore } from "@/types/algorithm/balance/types";
import type { PhysicalAnalysis3D } from "@/types/core/physics";
import {
  calculate3DCenterOfMass,
  calculate3DInertiaTensor,
  calculate3DPrincipalComponents,
  calculate3DDistribution,
  calculate3DIsotropy,
} from "../utils/physics3d";
import { analyzeSymmetry } from "../utils/symmetry3d";
import { analyzeSpatialDistribution } from "../utils/spatial-stats";

/**
 * 物理计算器权重配置
 */
interface PhysicsWeights {
  physical: number; // 物理特性权重
  spatial: number; // 空间特性权重
  symmetry: number; // 对称性权重
  volume: number; // 体积特性权重
}

/**
 * 物理计算器配置
 */
interface PhysicsCalculatorConfig {
  gridSize?: number; // 空间统计网格大小
  searchRadius?: number; // Ripley's K函数搜索半径
  weights: Partial<PhysicsWeights>; // 权重配置
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<PhysicsCalculatorConfig> & {
  weights: PhysicsWeights;
} = {
  gridSize: 1,
  searchRadius: 1,
  weights: {
    physical: 0.25, // 25%
    spatial: 0.3, // 30%
    symmetry: 0.25, // 25%
    volume: 0.2, // 20%
  },
};

/**
 * 质量元素类型
 */
interface MassElement {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  mass: number;
}

/**
 * Calculator for physical properties of the layout
 * Handles mass distribution, inertia tensor, and related calculations
 */
export class PhysicsCalculator {
  private config: Required<PhysicsCalculatorConfig> & {
    weights: PhysicsWeights;
  };

  constructor(config: Partial<PhysicsCalculatorConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      weights: {
        ...DEFAULT_CONFIG.weights,
        ...(config.weights ?? {}),
      },
    };
  }

  /**
   * 计算布局的物理特性
   * @param layout 产品位置矩形映射
   * @param products 产品数组
   * @returns 3D物理分析结果
   */
  calculate(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): PhysicalAnalysis3D {
    // 处理空布局或单个产品的情况
    if (products.length <= 1) {
      return {
        mass: {
          total: 0,
          center: { x: 0, y: 0, z: 0 },
          distribution: 0,
        },
        inertia: {
          tensor: {
            xx: 0,
            yy: 0,
            zz: 0,
            xy: 0,
            xz: 0,
            yz: 0,
          },
          principal: {
            axes: [
              { x: 1, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
            ],
            moments: [0, 0, 0],
          },
          gyrationRadius: 0,
          isotropy: 1,
        },
        symmetry: {
          axial: { x: 1, y: 1, z: 1 },
          planar: { xy: 1, xz: 1, yz: 1 },
          central: 1,
          overall: 1,
        },
        spatialStats: {
          ripleyK: {
            observed: 0,
            expected: 0,
            isCluster: false,
          },
          nearestNeighbor: {
            averageDistance: 0,
            expectedDistance: 0,
            ratio: 0,
          },
          entropy: {
            value: 0,
            normalized: 0,
          },
          quartiles: {
            q1: 0,
            q2: 0,
            q3: 0,
            iqr: 0,
          },
        },
      };
    }

    // 创建3D质量元素
    const elements = this.createMassElements(layout, products);

    // 提取点和质量数据
    const points = elements.map((e) => ({ x: e.x, y: e.y, z: e.z }));
    const masses = elements.map((e) => e.mass);

    // 计算质心
    const center = calculate3DCenterOfMass(points, masses);

    // 计算质量分布
    const distribution = calculate3DDistribution(points, masses, center);

    // 计算惯性张量
    const tensor = calculate3DInertiaTensor(points, masses, center);

    // 计算主轴和主力矩
    const principal = calculate3DPrincipalComponents(tensor);

    // 计算回转半径和各向同性
    const gyrationRadius = this.calculateGyrationRadius(principal.moments);
    const isotropy = calculate3DIsotropy(principal.moments);

    // 计算对称性
    const symmetry = analyzeSymmetry(points, masses, center);

    // 使用更新后的 analyzeSpatialDistribution
    const spatialStats = analyzeSpatialDistribution(
      points,
      center,
      this.config.gridSize,
      this.config.searchRadius,
    );
    return {
      mass: {
        total: masses.reduce((sum, m) => sum + m, 0),
        center,
        distribution,
      },
      inertia: {
        tensor,
        principal,
        gyrationRadius,
        isotropy,
      },
      symmetry,
      spatialStats,
    };
  }

  /**
   * 将物理分析结果转换为分布得分详情
   * @param analysis 3D物理分析结果
   * @returns 分布得分详情
   */
  toScoreDetails(
    analysis: PhysicalAnalysis3D,
  ): DetailedDistributionScore["details"] {
    // Project 3D moments to 2D by taking only x and y components
    const moments2D: [number, number] = [
      analysis.inertia.principal.moments[0],
      analysis.inertia.principal.moments[1],
    ];

    // Project 3D axes to 2D by taking only x and y components
    const axes2D: [[number, number], [number, number]] = [
      [
        analysis.inertia.principal.axes[0].x,
        analysis.inertia.principal.axes[0].y,
      ],
      [
        analysis.inertia.principal.axes[1].x,
        analysis.inertia.principal.axes[1].y,
      ],
    ];

    return {
      principalMoments: moments2D,
      principalAxes: axes2D,
      gyrationRadius: analysis.inertia.gyrationRadius,
      isotropy: analysis.inertia.isotropy,
      centerDeviation: analysis.mass.distribution,
      volumeBalance: {
        densityVariance: analysis.spatialStats.entropy.normalized,
        heightBalance:
          analysis.spatialStats.ripleyK.observed /
          analysis.spatialStats.ripleyK.expected,
        massDistribution: 1 - analysis.mass.distribution,
        symmetry: analysis.symmetry.overall,
      },
    };
  }

  /**
   * 计算回转半径
   * @param moments 主力矩
   * @returns 回转半径
   */
  private calculateGyrationRadius(moments: [number, number, number]): number {
    const totalInertia = moments.reduce((sum, m) => sum + m, 0);
    return Math.sqrt(totalInertia);
  }

  /**
   * 创建3D质量元素
   * @param layout 2D布局
   * @param products 产品列表
   * @returns 3D质量元素数组
   */
  private createMassElements(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): MassElement[] {
    const elements: MassElement[] = [];

    for (const product of products) {
      const rect = layout[product.id];
      if (!rect) continue;

      // 使用实际重量或根据体积估算
      const mass =
        product.weight ??
        (product.dimensions
          ? product.dimensions.width *
            product.dimensions.length *
            product.dimensions.height
          : 1);

      // 创建3D质量元素
      elements.push({
        x: rect.x + rect.width / 2, // 中心x坐标
        y: rect.y + rect.length / 2, // 中心y坐标
        z: product.dimensions?.height ? product.dimensions.height / 2 : 0, // 中心z坐标
        width: rect.width,
        height: rect.length,
        depth: product.dimensions?.height ?? 1,
        mass,
      });
    }

    return elements;
  }
}
