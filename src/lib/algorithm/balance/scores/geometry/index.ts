import type { Rectangle, Product, Point2D } from '@/types/geometry';
import type { DetailedGeometryScore } from '@/types/balance';

/**
 * 计算几何平衡分数
 * 使用物理学和线性代数方法评估布局的平衡性
 * 
 * 核心指标：
 * 1. 惯性张量（Inertia Tensor）- 描述质量分布
 * 2. 主轴方向（Principal Axes）- 评估对称性
 * 3. 陀螺矩（Gyration Radius）- 评估分布均匀性
 */
export function calculateGeometryScore(
  layout: Record<number, Rectangle>,
  products: Product[]
): DetailedGeometryScore {
  // 如果没有产品，返回满分
  if (products.length === 0) {
    return {
      score: 100,
      details: {
        principalMoments: [0, 0],
        principalAxes: [[1, 0], [0, 1]],
        gyrationRadius: 0,
        isotropy: 1,
        centerDeviation: 0
      }
    };
  }

  // 1. 计算质心
  const totalWeight = products.reduce((sum, p) => sum + p.weight, 0);
  const centerOfMass: Point2D = {
    x: products.reduce((sum, p) => sum + p.weight * (layout[p.id]?.x ?? 0), 0) / totalWeight,
    y: products.reduce((sum, p) => sum + p.weight * (layout[p.id]?.y ?? 0), 0) / totalWeight
  };

  // 2. 计算惯性张量（相对于质心）
  let Ixx = 0, Iyy = 0, Ixy = 0;
  products.forEach(p => {
    const x = (layout[p.id]?.x ?? 0) - centerOfMass.x;
    const y = (layout[p.id]?.y ?? 0) - centerOfMass.y;
    Ixx += p.weight * y * y;  // y方向的惯性矩
    Iyy += p.weight * x * x;  // x方向的惯性矩
    Ixy -= p.weight * x * y;  // 混合惯性积
  });

  // 3. 计算主轴和主惯性矩
  const trace = Ixx + Iyy;
  const det = Ixx * Iyy - Ixy * Ixy;
  const discriminant = Math.sqrt(trace * trace - 4 * det);
  
  // 主惯性矩（特征值）
  const lambda1 = (trace + discriminant) / 2;
  const lambda2 = (trace - discriminant) / 2;
  
  // 主轴方向（特征向量）
  const theta = Math.atan2(2 * Ixy, Ixx - Iyy) / 2;
  const principalAxes: [[number, number], [number, number]] = [
    [Math.cos(theta), -Math.sin(theta)],
    [Math.sin(theta), Math.cos(theta)]
  ];

  // 4. 计算评分指标
  // 4.1 各向同性比（isotropy）- 评估分布均匀性
  const isotropy = lambda2 / lambda1;  // 0到1之间，1表示完全各向同性

  // 4.2 陀螺半径（gyration radius）- 评估空间利用
  const maxRadius = Math.sqrt(
    products.reduce((max, p) => {
      const x = (layout[p.id]?.x ?? 0) - centerOfMass.x;
      const y = (layout[p.id]?.y ?? 0) - centerOfMass.y;
      return Math.max(max, x * x + y * y);
    }, 0)
  );
  // 避免除以零，如果maxRadius为0（单个产品在原点)),则设为1
  const normalizedMaxRadius = maxRadius === 0 ? 1 : maxRadius;
  const gyrationRadius = Math.sqrt((lambda1 + lambda2) / totalWeight) / normalizedMaxRadius;

  // 4.3 质心偏移（相对于几何中心）
  const geometricCenter: Point2D = {
    x: (products.reduce((min, p) => Math.min(min, layout[p.id]?.x ?? 0), Infinity) +
        products.reduce((max, p) => Math.max(max, layout[p.id]?.x ?? 0), -Infinity)) / 2,
    y: (products.reduce((min, p) => Math.min(min, layout[p.id]?.y ?? 0), Infinity) +
        products.reduce((max, p) => Math.max(max, layout[p.id]?.y ?? 0), -Infinity)) / 2
  };

  const centerDeviation = Math.sqrt(
    Math.pow(centerOfMass.x - geometricCenter.x, 2) +
    Math.pow(centerOfMass.y - geometricCenter.y, 2)
  ) / normalizedMaxRadius;

  // 5. 计算最终分数
  // 调整评分参数，使分数更合理
  // 5.1 各向同性分数（40分）- 使用更温和的幂函数
  const isotropyScore = 40 * (0.4 + 0.6 * Math.pow(isotropy, 0.05));  // 进一步提高基础分，更温和的惩罚
  
  // 5.2 陀螺半径分数（30分）- 减小衰减速率
  const gyrationScore = 30 * (0.2 + 0.8 * Math.exp(-0.8 * gyrationRadius));  // 保持不变
  
  // 5.3 质心偏移分数（30分）- 减小衰减速率并提高基础分
  const centerScore = 30 * (0.2 + 0.8 * Math.exp(-2 * centerDeviation));  // 降低基础分，增加衰减系数

  // 对于单个产品的特殊处理
  const finalScore = products.length === 1 
    ? 95  // 单个产品默认给95分
    : Math.min(100, Math.round(isotropyScore + gyrationScore + centerScore));

  // 对于完美对称布局的特殊处理
  const isNearPerfect = isotropy > 0.95 && centerDeviation < 0.1 && gyrationRadius < 0.8;
  const isSymmetric = isotropy > 0.8 && centerDeviation < 0.2;  // 新增：检测对称布局
  
  let finalScoreWithBonus = finalScore;
  if (isNearPerfect) {
    finalScoreWithBonus = Math.min(100, finalScore + 5);
  } else if (isSymmetric) {
    finalScoreWithBonus = Math.min(100, finalScore + 3);
  }
  
  return {
    score: finalScoreWithBonus,
    details: {
      principalMoments: [lambda1, lambda2],
      principalAxes,
      gyrationRadius,
      isotropy,
      centerDeviation
    }
  };
}
