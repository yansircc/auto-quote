/**
 * 核心类型和配置
 */
export type { PositionConfig, PositionInput } from "./core/types";
export { PARAM_RANGES, SUM_CONSTRAINED_GROUPS } from "./core/config";

/**
 * 参数映射工具
 */
export { paramsToConfig } from "./utils/param-converter";

/**
 * 运行器
 */
export { runPositionOptimizer } from "./runner";
