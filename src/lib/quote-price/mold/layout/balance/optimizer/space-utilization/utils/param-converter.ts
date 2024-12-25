import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SpaceConfig } from "../core/types";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  createSpaceThresholdMappings,
  createSpaceWeightMappings,
  createSpaceScoreMappings,
  createSpaceBonusMappings,
  createSpacePenaltyMappings,
} from "./param-mapping-utils";
import { SpaceMetric } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createSpaceThresholdMappings(SpaceMetric.VolumeRatio),
  ...createSpaceThresholdMappings(SpaceMetric.AspectRatio),

  // 权重映射
  ...createSpaceWeightMappings(),

  // 分数区间映射
  ...createSpaceScoreMappings(SpaceMetric.VolumeRatio),
  ...createSpaceScoreMappings(SpaceMetric.AspectRatio),

  // 奖励映射
  ...createSpaceBonusMappings(),

  // 惩罚映射
  ...createSpacePenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  SpaceConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
