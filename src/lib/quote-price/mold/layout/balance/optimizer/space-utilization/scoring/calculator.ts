import type { SpaceInput, SpaceConfig } from "../core/types";
import { SpaceMetric } from "../core/types";
import {
  calculateMetricScore,
  calculateBonus,
  calculatePenalty,
  calculateWeightedScore,
  normalizeScore,
  type PowerConfig,
  type PenaltyCalcConfig,
  type BonusConfig,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 计算空间利用率评分
 */
export function calculateScore(input: SpaceInput, config: SpaceConfig) {
  const {
    [SpaceMetric.VolumeRatio]: volumeRatio,
    [SpaceMetric.AspectRatio]: aspectRatio,
  } = input;

  const scores: Record<SpaceMetric | "bonus" | "penalty" | "total", number> = {
    [SpaceMetric.VolumeRatio]: 0,
    [SpaceMetric.AspectRatio]: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (!Number.isFinite(volumeRatio) || !Number.isFinite(aspectRatio)) {
    return scores;
  }

  // 分段幂次配置
  const volumeRatioPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对体积利用率更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const aspectRatioPowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，对形状均衡度敏感度适中
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算体积利用率得分（越大越好）
  scores[SpaceMetric.VolumeRatio] = calculateMetricScore(
    volumeRatio,
    config.thresholds[SpaceMetric.VolumeRatio],
    config.scores[SpaceMetric.VolumeRatio],
    volumeRatioPowers,
    false, // 不使用平滑衰减
    "asc", // 越大越好
  );

  // 计算长宽高比均衡度得分（需要特殊处理）
  const normalizedAspectRatio =
    aspectRatio > 1
      ? aspectRatio // 如果 > 1，保持原值
      : 1 / aspectRatio; // 如果 < 1，取倒数，使其 > 1

  scores[SpaceMetric.AspectRatio] = calculateMetricScore(
    normalizedAspectRatio,
    config.thresholds[SpaceMetric.AspectRatio],
    config.scores[SpaceMetric.AspectRatio],
    aspectRatioPowers,
  );

  // 规范化得分
  scores[SpaceMetric.VolumeRatio] = normalizeScore(
    scores[SpaceMetric.VolumeRatio],
  );
  scores[SpaceMetric.AspectRatio] = normalizeScore(
    scores[SpaceMetric.AspectRatio],
  );

  // 计算组合奖励
  const bonusConfig: BonusConfig<SpaceInput> = {
    perfect: { ...input, score: config.bonus.perfect?.score ?? 0 },
    excellent: { ...input, score: config.bonus.excellent?.score ?? 0 },
    good: { ...input, score: config.bonus.good?.score ?? 0 },
  };
  scores.bonus = calculateBonus(input, bonusConfig);

  // 惩罚计算配置
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.8, // 平滑因子（适中平滑度）
    scaleFactor: 0.8, // 缩放因子（适中惩罚强度）
    useSquareRoot: true, // 使用平方根
  };

  // 计算组合惩罚
  scores.penalty = calculatePenalty(
    input,
    {
      bad: {
        [SpaceMetric.VolumeRatio]: {
          threshold:
            config.penalty.bad[SpaceMetric.VolumeRatio]?.threshold ?? 0,
          score: config.penalty.bad[SpaceMetric.VolumeRatio]?.score ?? 0,
        },
        [SpaceMetric.AspectRatio]: {
          threshold:
            config.penalty.bad[SpaceMetric.AspectRatio]?.threshold ?? 0,
          score: config.penalty.bad[SpaceMetric.AspectRatio]?.score ?? 0,
        },
      },
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    {
      [SpaceMetric.VolumeRatio]: scores[SpaceMetric.VolumeRatio],
      [SpaceMetric.AspectRatio]: scores[SpaceMetric.AspectRatio],
    },
    config.weights,
  );

  // 计算最终得分
  scores.total = baseScore + scores.bonus - scores.penalty;

  // 添加调试日志
  // console.log("Input:", input);
  // console.log("Thresholds:", config.thresholds);
  // console.log("Scores:", config.scores);
  // console.log("Weights:", config.weights);
  // console.log("Individual scores:", {
  //   volumeRatio: scores[SpaceMetric.VolumeRatio],
  //   aspectRatio: scores[SpaceMetric.AspectRatio],
  // });
  // console.log("Base score:", baseScore);
  // console.log("Bonus:", scores.bonus);
  // console.log("Penalty:", scores.penalty);
  // console.log("Total:", scores.total);

  return scores;
}
