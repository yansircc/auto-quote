import {
  createParamConverter,
  type ParamMapping,
  type FlatParams as GenericFlatParams,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { AspectRatioConfig } from "../core/types";
import { RatioType } from "../core/types";
import {
  createRatioThresholdMappings,
  createRatioWeightMappings,
  createRatioScoreMappings,
  createRatioBonusMappings,
  createRatioPenaltyMappings,
} from "./param-mapping-utils";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createRatioThresholdMappings(RatioType.LongestToShortest),
  ...createRatioThresholdMappings(RatioType.MiddleToShortest),
  ...createRatioThresholdMappings(RatioType.LongestToMiddle),

  // 权重映射
  ...createRatioWeightMappings(),

  // 分数区间映射
  ...createRatioScoreMappings(RatioType.LongestToShortest),
  ...createRatioScoreMappings(RatioType.MiddleToShortest),
  ...createRatioScoreMappings(RatioType.LongestToMiddle),

  // 奖励映射
  ...createRatioBonusMappings(),

  // 惩罚映射
  ...createRatioPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  AspectRatioConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
