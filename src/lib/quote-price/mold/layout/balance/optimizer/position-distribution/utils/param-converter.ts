import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { PositionConfig } from "../core/types";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  createPositionThresholdMappings,
  createPositionWeightMappings,
  createPositionScoreMappings,
  createPositionBonusMappings,
  createPositionPenaltyMappings,
} from "./param-mapping-utils";
import { PositionMetric } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createPositionThresholdMappings(PositionMetric.Deviation),
  ...createPositionThresholdMappings(PositionMetric.Height),

  // 权重映射
  ...createPositionWeightMappings(),

  // 分数区间映射
  ...createPositionScoreMappings(PositionMetric.Deviation),
  ...createPositionScoreMappings(PositionMetric.Height),

  // 奖励映射
  ...createPositionBonusMappings(),

  // 惩罚映射
  ...createPositionPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  PositionConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
