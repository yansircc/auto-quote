import type { ParamGroup } from "./types";

/**
 * Create a parameter group with name and params
 */
export function createParamGroup(name: string, params: string[]): ParamGroup {
  return { name, params };
}

/**
 * Create an ordered threshold group
 */
export function createOrderedThresholdGroup(
  name: string,
  prefix: string,
): ParamGroup {
  return createParamGroup(name, [
    `${prefix}_PERFECT`,
    `${prefix}_GOOD`,
    `${prefix}_MEDIUM`,
    `${prefix}_BAD`,
  ]);
}

/**
 * Create a score group for a specific prefix
 */
export function createScoreGroup(name: string, prefix: string): ParamGroup {
  return createParamGroup(name, [
    `SCORE_${prefix}_BAD_BASE`,
    `SCORE_${prefix}_MEDIUM_BASE`,
    `SCORE_${prefix}_GOOD_BASE`,
    `SCORE_${prefix}_PERFECT_BASE`,
  ]);
}

/**
 * Create a bonus group for specific params
 */
export function createBonusGroup(
  params: string[],
  type: "ratio" | "distribution" = "ratio",
): ParamGroup {
  return createParamGroup(
    `组合奖励 - ${type === "ratio" ? "比例" : "距离分布"}`,
    params,
  );
}

/**
 * Create a bonus score group
 */
export function createBonusScoreGroup(): ParamGroup {
  return createParamGroup("奖励分数", [
    "BONUS_PERFECT_SCORE",
    "BONUS_EXCELLENT_SCORE",
    "BONUS_GOOD_SCORE",
  ]);
}
