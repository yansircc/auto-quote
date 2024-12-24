import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { PositionConfig, FlatParams } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 偏离阈值
  {
    path: ["thresholds", "deviation", "perfect"],
    paramName: "DEVIATION_PERFECT",
  },
  { path: ["thresholds", "deviation", "good"], paramName: "DEVIATION_GOOD" },
  {
    path: ["thresholds", "deviation", "medium"],
    paramName: "DEVIATION_MEDIUM",
  },
  { path: ["thresholds", "deviation", "bad"], paramName: "DEVIATION_BAD" },

  // 极差比阈值
  { path: ["thresholds", "height", "perfect"], paramName: "HEIGHT_PERFECT" },
  { path: ["thresholds", "height", "good"], paramName: "HEIGHT_GOOD" },
  { path: ["thresholds", "height", "medium"], paramName: "HEIGHT_MEDIUM" },
  { path: ["thresholds", "height", "bad"], paramName: "HEIGHT_BAD" },

  // 权重
  { path: ["weights", "deviation"], paramName: "WEIGHT_DEVIATION" },
  { path: ["weights", "height"], paramName: "WEIGHT_HEIGHT" },

  // 分数区间 - 偏离
  {
    path: ["scores", "deviation", "perfect", "base"],
    paramName: "SCORE_DEVIATION_PERFECT_BASE",
  },
  {
    path: ["scores", "deviation", "perfect", "factor"],
    paramName: "SCORE_DEVIATION_PERFECT_FACTOR",
  },
  {
    path: ["scores", "deviation", "good", "base"],
    paramName: "SCORE_DEVIATION_GOOD_BASE",
  },
  {
    path: ["scores", "deviation", "good", "factor"],
    paramName: "SCORE_DEVIATION_GOOD_FACTOR",
  },
  {
    path: ["scores", "deviation", "medium", "base"],
    paramName: "SCORE_DEVIATION_MEDIUM_BASE",
  },
  {
    path: ["scores", "deviation", "medium", "factor"],
    paramName: "SCORE_DEVIATION_MEDIUM_FACTOR",
  },
  {
    path: ["scores", "deviation", "bad", "base"],
    paramName: "SCORE_DEVIATION_BAD_BASE",
  },
  {
    path: ["scores", "deviation", "bad", "factor"],
    paramName: "SCORE_DEVIATION_BAD_FACTOR",
  },

  // 分数区间 - 高度
  {
    path: ["scores", "height", "perfect", "base"],
    paramName: "SCORE_HEIGHT_PERFECT_BASE",
  },
  {
    path: ["scores", "height", "perfect", "factor"],
    paramName: "SCORE_HEIGHT_PERFECT_FACTOR",
  },
  {
    path: ["scores", "height", "good", "base"],
    paramName: "SCORE_HEIGHT_GOOD_BASE",
  },
  {
    path: ["scores", "height", "good", "factor"],
    paramName: "SCORE_HEIGHT_GOOD_FACTOR",
  },
  {
    path: ["scores", "height", "medium", "base"],
    paramName: "SCORE_HEIGHT_MEDIUM_BASE",
  },
  {
    path: ["scores", "height", "medium", "factor"],
    paramName: "SCORE_HEIGHT_MEDIUM_FACTOR",
  },
  {
    path: ["scores", "height", "bad", "base"],
    paramName: "SCORE_HEIGHT_BAD_BASE",
  },
  {
    path: ["scores", "height", "bad", "factor"],
    paramName: "SCORE_HEIGHT_BAD_FACTOR",
  },

  // 组合奖励
  {
    path: ["bonus", "perfect", "deviation"],
    paramName: "BONUS_PERFECT_DEVIATION",
  },
  { path: ["bonus", "perfect", "height"], paramName: "BONUS_PERFECT_HEIGHT" },
  { path: ["bonus", "perfect", "score"], paramName: "BONUS_PERFECT_SCORE" },
  {
    path: ["bonus", "excellent", "deviation"],
    paramName: "BONUS_EXCELLENT_DEVIATION",
  },
  {
    path: ["bonus", "excellent", "height"],
    paramName: "BONUS_EXCELLENT_HEIGHT",
  },
  { path: ["bonus", "excellent", "score"], paramName: "BONUS_EXCELLENT_SCORE" },
  { path: ["bonus", "good", "deviation"], paramName: "BONUS_GOOD_DEVIATION" },
  { path: ["bonus", "good", "height"], paramName: "BONUS_GOOD_HEIGHT" },
  { path: ["bonus", "good", "score"], paramName: "BONUS_GOOD_SCORE" },

  // 惩罚参数
  {
    path: ["penalty", "bad", "deviation", "threshold"],
    paramName: "PENALTY_BAD_DEVIATION_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "deviation", "score"],
    paramName: "PENALTY_BAD_DEVIATION_SCORE",
  },
  {
    path: ["penalty", "bad", "height", "threshold"],
    paramName: "PENALTY_BAD_HEIGHT_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "height", "score"],
    paramName: "PENALTY_BAD_HEIGHT_SCORE",
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
  PositionConfig,
  FlatParams
>(PARAM_MAPPINGS);
