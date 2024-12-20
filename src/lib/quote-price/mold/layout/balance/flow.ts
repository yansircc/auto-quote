import type { Point3D, Cavity, CavityPosition } from "./types";

/**
 * 计算两点之间的距离
 */
function calculateDistance(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2) + 
    Math.pow(p2.z - p1.z, 2)
  );
}

/**
 * 计算最优注胶点位置
 * 使用重心法计算，考虑每个型腔的体积作为权重
 */
function calculateInjectionPoint(cavities: CavityPosition[]): Point3D {
  const totalVolume = cavities.reduce((sum, c) => sum + c.volume, 0);
  
  return {
    x: cavities.reduce((sum, c) => sum + c.position.x * c.volume, 0) / totalVolume,
    y: cavities.reduce((sum, c) => sum + c.position.y * c.volume, 0) / totalVolume,
    z: cavities.reduce((sum, c) => sum + c.position.z * c.volume, 0) / totalVolume
  };
}

/**
 * 计算流动平衡评分
 * @param cavities 型腔列表，每个型腔必须包含尺寸、体积和位置信息
 * @returns 流动平衡评分 (0-100)
 * @throws 如果有型腔没有位置信息
 */
export function calculateFlowBalance(cavities: Cavity[]): number {
  // 处理边界情况
  if (cavities.length === 0) {
    return 0;
  }

  // 如果只有一个型腔，直接返回满分
  if (cavities.length === 1) {
    return 100;
  }

  // 确保所有型腔都有位置信息
  if (!cavities.every(c => c.position)) {
    throw new Error('所有型腔都必须包含位置信息');
  }

  // 转换为型腔位置列表
  const cavityPositions: CavityPosition[] = cavities.map(c => ({
    position: c.position!,
    volume: c.volume
  }));

  // 检查体积分布是否合理
  const totalVolume = cavities.reduce((sum, c) => sum + c.volume, 0);
  const avgVolume = totalVolume / cavities.length;
  const volumeVariance = cavities.reduce((sum, c) => 
    sum + Math.pow(c.volume - avgVolume, 2), 0
  ) / cavities.length;
  
  console.log('体积分布:', {
    totalVolume,
    avgVolume,
    volumeVariance,
    volumeRatio: volumeVariance / (avgVolume * avgVolume),
  });

  if (volumeVariance > avgVolume * avgVolume) {
    const score = Math.min(70, 100 * (1 - volumeVariance / (avgVolume * avgVolume)));
    console.log('体积差异过大，返回分数:', score);
    return score;
  }

  // 计算最优注胶点
  const injectionPoint = calculateInjectionPoint(cavityPositions);
  console.log('注胶点位置:', injectionPoint);

  // 计算每个型腔到注胶点的距离
  const distances = cavityPositions.map(cavity => 
    calculateDistance(cavity.position, injectionPoint)
  );
  console.log('型腔位置:', cavityPositions.map(c => c.position));
  console.log('到注胶点距离:', distances);

  // 计算流动平衡性
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
  const standardDeviation = Math.sqrt(variance);

  // 计算最终得分
  const balanceRatio = standardDeviation / avgDistance;
  // 调整评分标准：当 balanceRatio > 0.5 时开始扣分，> 1.0 时得0分
  const score = Math.max(0, Math.min(100, 100 * (1 - balanceRatio / 0.5)));
  
  console.log('流动平衡性:', {
    avgDistance,
    standardDeviation,
    balanceRatio,
    score,
  });
  
  return score;
}
