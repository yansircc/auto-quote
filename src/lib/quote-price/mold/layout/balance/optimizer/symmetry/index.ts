/**
 * 核心类型和配置
 */
export type { SymmetryConfig, SymmetryInput } from "./core/types";
export { PARAM_RANGES, SUM_CONSTRAINED_GROUPS } from "./core/config";

/**
 * 参数映射工具
 */
export { paramsToConfig } from "./utils/param-converter";

/**
 * 运行器
 */
export { runSymmetryOptimizer } from "./runner";
