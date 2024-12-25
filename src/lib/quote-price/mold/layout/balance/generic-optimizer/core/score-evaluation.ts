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
    expect: { min?: number; max?: number; exact?: number },
    config: {
      baseFitness?: number;
      bonus?: number;
      penalty?: number;
    } = {},
  ): number {
    const { baseFitness = 1, bonus = 0.2, penalty = 0.5 } = config;
    const expectation = {
      min: expect.min ?? expect.exact ?? 0,
      max: expect.max ?? expect.exact ?? 100,
    };

    // 如果在范围内，给予奖励
    if (this.isInRange(actual, expectation)) {
      return baseFitness * (1 + bonus);
    }

    // 否则根据偏离程度计算惩罚
    const distance = this.calculateDistance(actual, expectation);
    const maxDistance = Math.max(
      Math.abs(expectation.max - expectation.min),
      Math.abs(actual - expectation.min),
      Math.abs(actual - expectation.max),
    );
    const penaltyRatio = distance / maxDistance;

    return baseFitness * (1 - penalty * penaltyRatio);
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
