import {
  createParamConverter,
  type ParamMapping,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SymmetryConfig } from "../core/types";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  createSymmetryThresholdMappings,
  createSymmetryWeightMappings,
  createSymmetryScoreMappings,
  createSymmetryBonusMappings,
  createSymmetryPenaltyMappings,
} from "./param-mapping-utils";
import { SymmetryMetric } from "../core/types";

/**
 * 参数映射配置
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // 阈值映射
  ...createSymmetryThresholdMappings(SymmetryMetric.Axial),
  ...createSymmetryThresholdMappings(SymmetryMetric.Mass),

  // 权重映射
  ...createSymmetryWeightMappings(),

  // 分数区间映射
  ...createSymmetryScoreMappings(SymmetryMetric.Axial),
  ...createSymmetryScoreMappings(SymmetryMetric.Mass),

  // 奖励映射
  ...createSymmetryBonusMappings(),

  // 惩罚映射
  ...createSymmetryPenaltyMappings(),
];

/**
 * 创建参数转换器
 */
export const { paramsToConfig } = createParamConverter<
  SymmetryConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
