import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { MomentumConfig, FlatParams } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 比率阈值
  { path: ["thresholds", "ratio", "perfect"], paramName: "RATIO_PERFECT" },
  { path: ["thresholds", "ratio", "good"], paramName: "RATIO_GOOD" },
  { path: ["thresholds", "ratio", "medium"], paramName: "RATIO_MEDIUM" },
  { path: ["thresholds", "ratio", "bad"], paramName: "RATIO_BAD" },

  // RSD阈值
  { path: ["thresholds", "rsd", "perfect"], paramName: "RSD_PERFECT" },
  { path: ["thresholds", "rsd", "good"], paramName: "RSD_GOOD" },
  { path: ["thresholds", "rsd", "medium"], paramName: "RSD_MEDIUM" },
  { path: ["thresholds", "rsd", "bad"], paramName: "RSD_BAD" },

  // 权重
  { path: ["weights", "ratio"], paramName: "WEIGHT_RATIO" },
  { path: ["weights", "rsd"], paramName: "WEIGHT_RSD" },

  // 分数区间 - 比率
  {
    path: ["scores", "ratio", "perfect", "base"],
    paramName: "SCORE_RATIO_PERFECT_BASE",
  },
  {
    path: ["scores", "ratio", "perfect", "factor"],
    paramName: "SCORE_RATIO_PERFECT_FACTOR",
  },
  {
    path: ["scores", "ratio", "good", "base"],
    paramName: "SCORE_RATIO_GOOD_BASE",
  },
  {
    path: ["scores", "ratio", "good", "factor"],
    paramName: "SCORE_RATIO_GOOD_FACTOR",
  },
  {
    path: ["scores", "ratio", "medium", "base"],
    paramName: "SCORE_RATIO_MEDIUM_BASE",
  },
  {
    path: ["scores", "ratio", "medium", "factor"],
    paramName: "SCORE_RATIO_MEDIUM_FACTOR",
  },
  {
    path: ["scores", "ratio", "bad", "base"],
    paramName: "SCORE_RATIO_BAD_BASE",
  },
  {
    path: ["scores", "ratio", "bad", "factor"],
    paramName: "SCORE_RATIO_BAD_FACTOR",
  },

  // 分数区间 - RSD
  {
    path: ["scores", "rsd", "perfect", "base"],
    paramName: "SCORE_RSD_PERFECT_BASE",
  },
  {
    path: ["scores", "rsd", "perfect", "factor"],
    paramName: "SCORE_RSD_PERFECT_FACTOR",
  },
  {
    path: ["scores", "rsd", "good", "base"],
    paramName: "SCORE_RSD_GOOD_BASE",
  },
  {
    path: ["scores", "rsd", "good", "factor"],
    paramName: "SCORE_RSD_GOOD_FACTOR",
  },
  {
    path: ["scores", "rsd", "medium", "base"],
    paramName: "SCORE_RSD_MEDIUM_BASE",
  },
  {
    path: ["scores", "rsd", "medium", "factor"],
    paramName: "SCORE_RSD_MEDIUM_FACTOR",
  },
  {
    path: ["scores", "rsd", "bad", "base"],
    paramName: "SCORE_RSD_BAD_BASE",
  },
  {
    path: ["scores", "rsd", "bad", "factor"],
    paramName: "SCORE_RSD_BAD_FACTOR",
  },

  // 组合奖励
  { path: ["bonus", "perfect", "ratio"], paramName: "BONUS_PERFECT_RATIO" },
  { path: ["bonus", "perfect", "rsd"], paramName: "BONUS_PERFECT_RSD" },
  { path: ["bonus", "perfect", "score"], paramName: "BONUS_PERFECT_SCORE" },
  { path: ["bonus", "excellent", "ratio"], paramName: "BONUS_EXCELLENT_RATIO" },
  { path: ["bonus", "excellent", "rsd"], paramName: "BONUS_EXCELLENT_RSD" },
  { path: ["bonus", "excellent", "score"], paramName: "BONUS_EXCELLENT_SCORE" },
  { path: ["bonus", "good", "ratio"], paramName: "BONUS_GOOD_RATIO" },
  { path: ["bonus", "good", "rsd"], paramName: "BONUS_GOOD_RSD" },
  { path: ["bonus", "good", "score"], paramName: "BONUS_GOOD_SCORE" },

  // 惩罚参数
  {
    path: ["penalty", "bad", "ratio", "threshold"],
    paramName: "PENALTY_BAD_RATIO_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "ratio", "score"],
    paramName: "PENALTY_BAD_RATIO_SCORE",
  },
  {
    path: ["penalty", "bad", "rsd", "threshold"],
    paramName: "PENALTY_BAD_RSD_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "rsd", "score"],
    paramName: "PENALTY_BAD_RSD_SCORE",
  },
  {
    path: ["penalty", "combined", "score"],
    paramName: "PENALTY_COMBINED_SCORE",
  },
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  MomentumConfig,
  FlatParams
>(PARAM_MAPPINGS);
