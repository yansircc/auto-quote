/**
 * 核心类型和配置
 */
export type { UniformityInput, UniformityConfig } from "./core/types";
export { PARAM_RANGES, SUM_CONSTRAINED_GROUPS } from "./core/config";

/**
 * 优化器实例
 */
export { findBestConfig } from "./optimizer";

/**
 * 运行器
 */
export { runUniformityOptimizer } from "./runner";
