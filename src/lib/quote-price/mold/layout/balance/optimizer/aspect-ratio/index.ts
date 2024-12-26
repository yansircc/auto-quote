/**
 * 核心类型
 */
export type { RatioInput as AspectRatioInput } from "./core/types";

/**
 * 运行器
 */
export { runAspectRatioOptimizer } from "./runner";

/**
 * 获取分数
 */
export { getScore as getAspectRatioScore } from "./optimizer";

/**
 * 最佳参数
 */
export { BEST_PARAMS as ASPECT_RATIO_BEST_PARAMS } from "./scoring/best-params";
