import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { ShapeConfig } from "../core/types";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  createShapeThresholdMappings,
  createShapeWeightMappings,
  createShapeScoreMappings,
  createShapeBonusMappings,
  createShapePenaltyMappings,
} from "./param-mapping-utils";
import { ShapeMetric } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createShapeThresholdMappings(ShapeMetric.DimensionDiff),
  ...createShapeThresholdMappings(ShapeMetric.ExtremeIndex),
  ...createShapeThresholdMappings(ShapeMetric.SwapRatio),

  // 权重映射
  ...createShapeWeightMappings(),

  // 分数区间映射
  ...createShapeScoreMappings(ShapeMetric.DimensionDiff),
  ...createShapeScoreMappings(ShapeMetric.ExtremeIndex),
  ...createShapeScoreMappings(ShapeMetric.SwapRatio),

  // 奖励映射
  ...createShapeBonusMappings(),

  // 惩罚映射
  ...createShapePenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  ShapeConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
