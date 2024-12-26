/**
 * 核心类型
 */
export type { DistributionInput as DistanceDistributionInput } from "./core/types";

/**
 * 运行器
 */
export { runDistributionOptimizer } from "./runner";

/**
 * 获取分数
 */
export { getScore as getDistanceDistributionScore } from "./optimizer";

/**
 * 最佳参数
 */
export { BEST_PARAMS as DISTANCE_DISTRIBUTION_BEST_PARAMS } from "./scoring/best-params";
