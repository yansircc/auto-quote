import {
  createOptimizer,
  createGeneticConfig,
  type OptimizerInstance,
  type FlatParams,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { PARAM_RANGES, PARAM_GROUPS } from "./core/config";
import { paramsToConfig } from "./utils/param-converter";
import { calculateScore } from "./scoring/calculator";
import { TEST_CASES } from "./scoring/test-cases";
import type { RatioInput, AspectRatioConfig } from "./core/types";

/**
 * 创建长宽比优化器实例
 */
export const optimizer: OptimizerInstance<
  RatioInput,
  AspectRatioConfig,
  FlatParams
> = createOptimizer<RatioInput, AspectRatioConfig>({
  // 核心评分函数
  calculateScore,
  // 参数转换
  flatParamsToConfig: paramsToConfig,
  // 遗传算法配置
  geneticConfig: createGeneticConfig(PARAM_RANGES, PARAM_GROUPS),
  // 测试用例
  testCases: TEST_CASES,
});

// 导出优化器的关键功能
export const { findBestConfig, getScore } = optimizer;
