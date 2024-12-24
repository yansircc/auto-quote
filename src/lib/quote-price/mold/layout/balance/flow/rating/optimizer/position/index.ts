/**
 * 核心类型和配置
 */
export type { PositionInput, PositionConfig, FlatParams } from "./core/types";
export { PARAM_RANGES, SUM_CONSTRAINED_GROUPS } from "./core/config";

/**
 * 评分计算
 */
export { calculateScore } from "./scoring/calculator";
export { TEST_CASES } from "./scoring/test-cases";

/**
 * 工具函数
 */
export { paramsToConfig } from "./utils/param-converter";

/**
 * 优化器实例
 */
export { findBestConfig } from "./optimizer";

/**
 * 运行器
 */
export { runPositionOptimizer } from "./runner";
