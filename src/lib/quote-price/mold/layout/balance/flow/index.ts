import type { BaseScoreResult } from "./types/scores";
import {
  calculateDistanceScore,
  calculatePositionScore,
  calculateMomentumScore,
  calculatePhysicalProperties,
  calculateRange,
  calculateRSD,
  calculateRatio,
} from "./rating";

/**
 * 计算流动平衡评分
 *
 * @param {Cuboid[]} cuboids - 长方体数组，每个长方体包含位置和重量信息
 * @returns 三个维度的评分结果
 */

interface Cuboid {
  position: { x: number; y: number; z: number };
  weight: number;
}

export function calculateFlowBalance(cuboids: Cuboid[]): BaseScoreResult {
  // 1. 边界情况处理
  if (!cuboids.length) {
    return {
      total: 0,
      breakdown: { distance: 0, position: 0, momentum: 0 },
    };
  }

  if (cuboids.length === 1) {
    return {
      total: 100,
      breakdown: { distance: 100, position: 100, momentum: 100 },
    };
  }

  // 2. 计算物理属性
  const props = calculatePhysicalProperties(cuboids);

  // 3. 计算各维度得分
  const distanceScore = calculateDistanceScore(
    calculateRSD(props.distances),
    calculateRange(props.distances),
    props.width,
    props.distances,
  );

  const positionScore = calculatePositionScore(
    props.deviation / props.width,
    props.relativeHeight,
    props.width,
  );

  const momentumScore = calculateMomentumScore(
    calculateRatio(props.moments),
    calculateRSD(props.moments),
    props.moments,
  );

  // 4. 计算总分（三个维度等权重）
  const total =
    (distanceScore.total + positionScore.total + momentumScore.total) / 3;

  return {
    total,
    breakdown: {
      distance: distanceScore.total,
      position: positionScore.total,
      momentum: momentumScore.total,
    },
  };
}
