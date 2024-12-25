import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { DistanceConfig, FlatParams } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 偏离阈值
  { path: ["thresholds", "cv", "perfect"], paramName: "CV_PERFECT" },
  { path: ["thresholds", "cv", "good"], paramName: "CV_GOOD" },
  { path: ["thresholds", "cv", "medium"], paramName: "CV_MEDIUM" },
  { path: ["thresholds", "cv", "bad"], paramName: "CV_BAD" },

  // 极差比阈值
  { path: ["thresholds", "range", "perfect"], paramName: "RANGE_PERFECT" },
  { path: ["thresholds", "range", "good"], paramName: "RANGE_GOOD" },
  { path: ["thresholds", "range", "medium"], paramName: "RANGE_MEDIUM" },
  { path: ["thresholds", "range", "bad"], paramName: "RANGE_BAD" },

  // 权重
  { path: ["weights", "cv"], paramName: "WEIGHT_CV" },
  { path: ["weights", "range"], paramName: "WEIGHT_RANGE" },

  // 分数区间 - 偏离
  {
    path: ["scores", "cv", "perfect", "base"],
    paramName: "SCORE_CV_PERFECT_BASE",
  },
  {
    path: ["scores", "cv", "perfect", "factor"],
    paramName: "SCORE_CV_PERFECT_FACTOR",
  },
  { path: ["scores", "cv", "good", "base"], paramName: "SCORE_CV_GOOD_BASE" },
  {
    path: ["scores", "cv", "good", "factor"],
    paramName: "SCORE_CV_GOOD_FACTOR",
  },
  {
    path: ["scores", "cv", "medium", "base"],
    paramName: "SCORE_CV_MEDIUM_BASE",
  },
  {
    path: ["scores", "cv", "medium", "factor"],
    paramName: "SCORE_CV_MEDIUM_FACTOR",
  },
  { path: ["scores", "cv", "bad", "base"], paramName: "SCORE_CV_BAD_BASE" },
  { path: ["scores", "cv", "bad", "factor"], paramName: "SCORE_CV_BAD_FACTOR" },

  // 分数区间 - 高度
  {
    path: ["scores", "range", "perfect", "base"],
    paramName: "SCORE_RANGE_PERFECT_BASE",
  },
  {
    path: ["scores", "range", "perfect", "factor"],
    paramName: "SCORE_RANGE_PERFECT_FACTOR",
  },
  {
    path: ["scores", "range", "good", "base"],
    paramName: "SCORE_RANGE_GOOD_BASE",
  },
  {
    path: ["scores", "range", "good", "factor"],
    paramName: "SCORE_RANGE_GOOD_FACTOR",
  },
  {
    path: ["scores", "range", "medium", "base"],
    paramName: "SCORE_RANGE_MEDIUM_BASE",
  },
  {
    path: ["scores", "range", "medium", "factor"],
    paramName: "SCORE_RANGE_MEDIUM_FACTOR",
  },
  {
    path: ["scores", "range", "bad", "base"],
    paramName: "SCORE_RANGE_BAD_BASE",
  },
  {
    path: ["scores", "range", "bad", "factor"],
    paramName: "SCORE_RANGE_BAD_FACTOR",
  },

  // 组合奖励
  { path: ["bonus", "perfect", "cv"], paramName: "BONUS_PERFECT_CV" },
  { path: ["bonus", "perfect", "range"], paramName: "BONUS_PERFECT_RANGE" },
  { path: ["bonus", "perfect", "score"], paramName: "BONUS_PERFECT_SCORE" },
  { path: ["bonus", "excellent", "cv"], paramName: "BONUS_EXCELLENT_CV" },
  { path: ["bonus", "excellent", "range"], paramName: "BONUS_EXCELLENT_RANGE" },
  { path: ["bonus", "excellent", "score"], paramName: "BONUS_EXCELLENT_SCORE" },
  { path: ["bonus", "good", "cv"], paramName: "BONUS_GOOD_CV" },
  { path: ["bonus", "good", "range"], paramName: "BONUS_GOOD_RANGE" },
  { path: ["bonus", "good", "score"], paramName: "BONUS_GOOD_SCORE" },

  // 惩罚参数
  {
    path: ["penalty", "bad", "cv", "threshold"],
    paramName: "PENALTY_BAD_CV_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "cv", "score"],
    paramName: "PENALTY_BAD_CV_SCORE",
  },
  {
    path: ["penalty", "bad", "range", "threshold"],
    paramName: "PENALTY_BAD_RANGE_THRESHOLD",
  },
  {
    path: ["penalty", "bad", "range", "score"],
    paramName: "PENALTY_BAD_RANGE_SCORE",
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
  DistanceConfig,
  FlatParams
>(PARAM_MAPPINGS);
