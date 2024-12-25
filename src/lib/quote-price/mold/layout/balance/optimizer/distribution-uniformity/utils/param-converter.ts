import {
  createParamConverter,
  type ParamMapping,
  type FlatParams as GenericFlatParams,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { UniformityConfig } from "../core/types";
import { UniformityMetric } from "../core/types";
import {
  createUniformityThresholdMappings,
  createUniformityWeightMappings,
  createUniformityScoreMappings,
  createUniformityBonusMappings,
  createUniformityPenaltyMappings,
} from "./param-mapping-utils";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createUniformityThresholdMappings(UniformityMetric.GridVariance),
  ...createUniformityThresholdMappings(UniformityMetric.DensityChange),
  ...createUniformityThresholdMappings(UniformityMetric.ClusterIndex),

  // 权重映射
  ...createUniformityWeightMappings(),

  // 分数区间映射
  ...createUniformityScoreMappings(UniformityMetric.GridVariance),
  ...createUniformityScoreMappings(UniformityMetric.DensityChange),
  ...createUniformityScoreMappings(UniformityMetric.ClusterIndex),

  // 奖励映射
  ...createUniformityBonusMappings(),

  // 惩罚映射
  ...createUniformityPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  UniformityConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
