export interface GeometryScoreConfig {
  similarity: {
    aspectRatioWeight: number;
    shapeWeight: number;
    dimensionWeight: number;
  };
  curves: {
    perfectScoreThreshold: number;
    nearPerfectThreshold: number;
    midPointRatio: number;
    slopeFactor: number;
    basePenaltyExponent: number;
  };
  tolerance: {
    ratio: number;
    minimum: number;
  };
}

// 默认配置
export const defaultConfig: GeometryScoreConfig = {
  similarity: {
    aspectRatioWeight: 0.6,    // 进一步增加长宽比权重
    shapeWeight: 0.3,          // 调整形状权重
    dimensionWeight: 0.1,      // 进一步降低尺寸权重
  },
  curves: {
    perfectScoreThreshold: 0.75,  // 降低完美分数阈值
    nearPerfectThreshold: 0.80,   // 降低近似完美阈值
    midPointRatio: 0.65,          // 降低中点比率，使曲线更陡峭
    slopeFactor: 8.0,             // 增加斜率因子，使分数变化更剧烈
    basePenaltyExponent: 3.0,     // 大幅增加惩罚指数，特别是对效率分数
  },
  tolerance: {
    ratio: 0.03,     // 适度的相对容差
    minimum: 0.1,    // 适度的绝对容差
  }
};
