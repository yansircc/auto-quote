/**
 * 几何平衡评分系统配置
 */
export const GeometricBalanceConfig = {
  // 评分权重
  weights: {
    volume: 0.25,
    aspectRatio: 0.25,
    shapeSimilarity: 0.3,
    dimensionalConsistency: 0.2,
  },

  // 体积评分参数
  volume: {
    highScoreThreshold: 0.85,
    midScoreThreshold: 0.55,
    lowScoreThreshold: 0.15,
    highScoreBase: 90,
    midScoreBase: 75,
    // 新增：评分函数配置
    scoringFunction: "sigmoid" as const,
    sigmoidSteepness: 10,
  },

  // 长宽比评分参数
  aspectRatio: {
    optimalRatio: 1.5,
    maxRatio: 3.0,
    scoreMultiplier: 0.8,
    // 新增：三维比例配置
    middleRatioWeight: 0.3,
    shortRatioWeight: 0.3,
  },

  // 形状相似度评分参数
  shapeSimilarity: {
    diffMultiplier: 0.4,
    // 新增：离群点配置
    outlierPenalty: 1.5,
    maxComparisons: 100,
    outlierWeight: 0.3,
  },

  // 维度一致性评分参数
  dimensionalConsistency: {
    maxCV: 0.3,
    cvMultiplier: 0.8,
    // 新增：残余分数配置
    minResidualScore: 5,
    smoothingFactor: 0.1,
  },
} as const;

/**
 * 流动平衡评分系统配置
 */
export const FlowBalanceConfig = {
  // TODO: 添加流动平衡的配置参数
} as const;

/**
 * 分布平衡评分系统配置
 */
export const DistributionBalanceConfig = {
  // TODO: 添加分布平衡的配置参数
} as const;
