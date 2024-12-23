import type { GeometricConfig } from "./types";
/**
 * 这里放置你常用的评分函数，如sigmoid、smoothPiecewise、cvScore、shapeSimilarityScore等
 * 仅示例伪代码
 */

/**
 * Sigmoid函数
 * @param x 实际输入值
 * @param midpoint 中心点
 * @param steepness 陡峭度
 * @returns [0,1]之间的映射结果
 */
export function sigmoid(
  x: number,
  midpoint: number,
  steepness: number,
): number {
  return 100 / (1 + Math.exp(-steepness * (x - midpoint)));
}

/**
 * 平滑分段函数
 * @param segments 每段[min, max, score]
 * @param x 当前输入
 * @param smoothingFactor 用于段与段衔接时做平滑过渡
 */
export function smoothPiecewise(
  segments: Array<{ min: number; max: number; score: number }>,
  x: number,
  smoothingFactor: number,
): number {
  // 对segments按min值排序
  segments.sort((a, b) => a.min - b.min);

  // 如果x是Infinity，直接返回最后一个区间的分数
  if (!Number.isFinite(x)) {
    return segments[segments.length - 1]!.score;
  }

  // 找到x所在的区间
  const currentSegment = segments.find((s) => x >= s.min && x <= s.max);

  // 如果x小于最小值或大于最大值，使用边界segment
  if (!currentSegment) {
    if (x < segments[0]!.min) {
      return segments[0]!.score;
    }
    return segments[segments.length - 1]!.score;
  }

  // 计算在当前区间内的位置比例
  const range = Math.max(0.0001, currentSegment.max - currentSegment.min);
  // const position = (x - currentSegment.min) / range;

  // 找到相邻的segment（如果存在）
  const segmentIndex = segments.indexOf(currentSegment);
  const nextSegment = segments[segmentIndex + 1];
  const prevSegment = segments[segmentIndex - 1];

  // 在区间边界附近进行平滑过渡
  const transitionZone = Math.max(0.0001, smoothingFactor * range);

  if (x <= currentSegment.min + transitionZone && prevSegment) {
    // 与前一个区间的平滑过渡
    const t = Math.max(
      0,
      Math.min(
        1,
        (x - (currentSegment.min - transitionZone)) / (2 * transitionZone),
      ),
    );
    return prevSegment.score * (1 - t) + currentSegment.score * t;
  } else if (x >= currentSegment.max - transitionZone && nextSegment) {
    // 与后一个区间的平滑过渡
    const t = Math.max(
      0,
      Math.min(
        1,
        (x - (currentSegment.max - transitionZone)) / (2 * transitionZone),
      ),
    );
    return currentSegment.score * (1 - t) + nextSegment.score * t;
  }

  return currentSegment.score;
}

// 添加类型守卫函数
function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * 体积比评分函数
 * 使用sigmoid函数实现平滑过渡
 */
export function volumeScore(
  ratio: number,
  config: GeometricConfig["volume"],
): number {
  const x = ratio;

  // 类型检查
  if (
    !isNumber(config.highScoreThreshold) ||
    !isNumber(config.midScoreThreshold) ||
    !isNumber(config.lowScoreThreshold) ||
    !isNumber(config.highScoreBase) ||
    !isNumber(config.midScoreBase)
  ) {
    throw new Error("Invalid configuration values");
  }

  if (!Number.isFinite(ratio) || ratio <= 0) return config.midScoreBase / 2;

  // 分段线性函数
  if (x >= config.highScoreThreshold) {
    return config.highScoreBase;
  } else if (x >= config.midScoreThreshold) {
    const t =
      (x - config.midScoreThreshold) /
      (config.highScoreThreshold - config.midScoreThreshold);
    return (
      config.midScoreBase + (config.highScoreBase - config.midScoreBase) * t
    );
  } else if (x >= config.lowScoreThreshold) {
    const t =
      (x - config.lowScoreThreshold) /
      (config.midScoreThreshold - config.lowScoreThreshold);
    return config.midScoreBase * t;
  }
  // 在极低比例时给予更严厉的惩罚
  return 0;
}

/**
 * 形状相似度评分函数
 * 使用指数惩罚处理离群点
 */
export function shapeSimilarityScore(
  similarity: number,
  config: GeometricConfig["shapeSimilarity"],
): number {
  if (!Number.isFinite(similarity)) return 10;

  // 将相似度限制在0-1之间
  similarity = Math.max(0, Math.min(1, similarity));

  // 对于高相似度（>0.9），给予更大的奖励
  if (similarity > 0.9) {
    return 85 + (similarity - 0.9) * 200; // 0.9->85, 0.95->95, 1.0->100
  }

  // 对于中等相似度（0.7-0.9），使用更陡峭的曲线
  if (similarity > 0.7) {
    return 70 + Math.pow(similarity - 0.7, 0.8) * 100; // 更快地接近85分
  }

  // 对于低相似度，使用更严厉的指数惩罚
  const penaltyFactor = Math.pow(1 - similarity, config.outlierPenalty * 1.2);
  return Math.max(
    10,
    70 * similarity * (1 - penaltyFactor * config.outlierWeight * 1.2),
  );
}

/**
 * 变异系数评分函数
 * 使用指数衰减处理极端情况
 */
export function cvScore(
  cv: number,
  maxCV: number,
  config: GeometricConfig["dimensionalConsistency"],
): number {
  // 类型检查
  if (!isNumber(config.cvMultiplier) || !isNumber(config.minResidualScore)) {
    throw new Error("Invalid configuration values");
  }

  if (!Number.isFinite(cv) || cv < 0) return config.minResidualScore;

  // 对于非常小的变异系数（高一致性），给予更高分数
  if (cv < maxCV * 0.25) {
    return 90 + (1 - cv / (maxCV * 0.25)) * 10; // 更容易达到90+分
  }

  // 对于中等变异系数，使用更平缓的衰减
  if (cv < maxCV * 0.8) {
    const t = cv / (maxCV * 0.8);
    return Math.max(
      config.minResidualScore,
      90 - Math.pow(t, 1.5) * 20, // 更平缓的衰减
    );
  }

  if (cv < maxCV) {
    const t = (cv - maxCV * 0.8) / (maxCV * 0.2);
    return Math.max(
      config.minResidualScore,
      70 - t * 50, // 70->20的线性衰减
    );
  }

  // 对于超出maxCV的情况，极快衰减
  const overflowRatio = cv / maxCV;
  const exponent = overflowRatio - 1;
  return Math.max(
    config.minResidualScore,
    20 * Math.exp(-config.cvMultiplier * 1.5 * exponent),
  );
}
