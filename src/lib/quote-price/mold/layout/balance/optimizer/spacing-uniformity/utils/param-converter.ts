import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SpacingConfig } from "../core/types";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  createSpacingThresholdMappings,
  createSpacingWeightMappings,
  createSpacingScoreMappings,
  createSpacingBonusMappings,
  createSpacingPenaltyMappings,
} from "./param-mapping-utils";
import { SpacingMetric } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createSpacingThresholdMappings(SpacingMetric.Distance),
  ...createSpacingThresholdMappings(SpacingMetric.Directional),

  // 权重映射
  ...createSpacingWeightMappings(),

  // 分数区间映射
  ...createSpacingScoreMappings(SpacingMetric.Distance),
  ...createSpacingScoreMappings(SpacingMetric.Directional),

  // 奖励映射
  ...createSpacingBonusMappings(),

  // 惩罚映射
  ...createSpacingPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  SpacingConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
