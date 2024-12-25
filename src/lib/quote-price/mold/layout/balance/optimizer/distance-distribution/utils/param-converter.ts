import {
  createParamConverter,
  type ParamMapping,
  type FlatParams as GenericFlatParams,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { DistributionConfig } from "../core/types";
import { DistributionMetric } from "../core/types";
import {
  createDistributionThresholdMappings,
  createDistributionWeightMappings,
  createDistributionScoreMappings,
  createDistributionBonusMappings,
  createDistributionPenaltyMappings,
} from "./param-mapping-utils";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createDistributionThresholdMappings(DistributionMetric.CV),
  ...createDistributionThresholdMappings(DistributionMetric.Range),

  // 权重映射
  ...createDistributionWeightMappings(),

  // 分数区间映射
  ...createDistributionScoreMappings(DistributionMetric.CV),
  ...createDistributionScoreMappings(DistributionMetric.Range),

  // 奖励映射
  ...createDistributionBonusMappings(),

  // 惩罚映射
  ...createDistributionPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  DistributionConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
