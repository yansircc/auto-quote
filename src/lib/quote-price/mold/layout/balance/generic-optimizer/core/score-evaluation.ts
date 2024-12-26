/**
 * Score evaluation utilities
 */
export class ScoreEvaluation {
  /**
   * Calculate fitness score based on actual value and expectation
   * @param actual Actual score
   * @param expect Expected score range
   * @param config Scoring configuration
   */
  static calculateFitnessScore(
    actual: number,
    expect: { min?: number; max?: number },
    config: {
      baseFitness?: number; // 基础分数
      successBase?: number; // 成功情况的基础分数
      failureBase?: number; // 失败情况的基础分数
      centerBonus?: number; // 靠近中心的奖励系数
      distancePenalty?: number; // 距离惩罚系数
    } = {},
  ): number {
    const {
      successBase = 80, // 成功情况从80分起步
      failureBase = 70, // 失败情况最高70分
      centerBonus = 0.2, // 中心奖励系数
      distancePenalty = 0.3, // 距离惩罚系数
    } = config;

    const min = expect.min ?? 0;
    const max = expect.max ?? 100;
    const center = (min + max) / 2;
    const range = max - min;

    // 在期望范围内
    if (actual >= min && actual <= max) {
      // 计算到中心点的距离比例
      const distanceToCenter = Math.abs(actual - center);
      const centerDistanceRatio = distanceToCenter / (range / 2);

      // 根据距离中心的远近给予奖励
      // centerDistanceRatio为0时（在中心）得到最高分数(successBase + 20)
      // centerDistanceRatio为1时（在边缘）得到基础分数(successBase)
      return successBase + (1 - centerDistanceRatio) * (centerBonus * 100);
    }

    // 在期望范围外
    const distanceToRange = Math.min(
      Math.abs(actual - min),
      Math.abs(actual - max),
    );
    const distanceRatio = distanceToRange / range;

    // 计算惩罚分数，但确保不会低于0分
    return Math.max(0, failureBase - distanceRatio * distancePenalty * 100);
  }

  /**
   * 判断分数是否在范围内
   */
  static isInRange(
    score: number,
    expect: { min: number; max: number },
  ): boolean {
    return score >= expect.min && score <= expect.max;
  }

  /**
   * 计算分数与期望范围的距离
   */
  static calculateDistance(
    score: number,
    expect: { min: number; max: number },
  ): number {
    if (score < expect.min) {
      return expect.min - score;
    }
    if (score > expect.max) {
      return score - expect.max;
    }
    return 0;
  }

  /**
   * 评估分数变化的质量
   */
  static evaluateScoreChange(
    previousScore: number,
    currentScore: number,
    expect: { min: number; max: number },
  ): "positive" | "negative" | "neutral" {
    const prevInRange = this.isInRange(previousScore, expect);
    const currInRange = this.isInRange(currentScore, expect);

    // 如果都在范围内，判断是否有提升
    if (prevInRange && currInRange) {
      return currentScore > previousScore
        ? "positive"
        : currentScore < previousScore
          ? "negative"
          : "neutral";
    }

    // 如果从范围外到范围内，为正向变化
    if (!prevInRange && currInRange) {
      return "positive";
    }

    // 如果从范围内到范围外，为负向变化
    if (prevInRange && !currInRange) {
      return "negative";
    }

    // 如果都在范围外，判断与目标的距离是否减小
    const prevDistance = this.calculateDistance(previousScore, expect);
    const currDistance = this.calculateDistance(currentScore, expect);
    return currDistance < prevDistance
      ? "positive"
      : currDistance > prevDistance
        ? "negative"
        : "neutral";
  }

  /**
   * 计算百分比变化
   */
  static calculatePercentageChange(
    previousValue: number,
    currentValue: number,
  ): number {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : Infinity;
    }
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  }
}
