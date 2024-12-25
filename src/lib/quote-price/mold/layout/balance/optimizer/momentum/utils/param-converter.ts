import {
  createParamConverter,
  type ParamMapping,
  type FlatParams as GenericFlatParams,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { MomentumConfig } from "../core/types";
import { MomentumMetric } from "../core/types";
import {
  createMomentumThresholdMappings,
  createMomentumWeightMappings,
  createMomentumScoreMappings,
  createMomentumBonusMappings,
  createMomentumPenaltyMappings,
} from "./param-mapping-utils";

/**
 * Parameter mapping configuration
 */
const PARAM_MAPPINGS: ParamMapping[] = [
  // Threshold mappings
  ...createMomentumThresholdMappings(MomentumMetric.Ratio),
  ...createMomentumThresholdMappings(MomentumMetric.RSD),

  // Weight mappings
  ...createMomentumWeightMappings(),

  // Score range mappings
  ...createMomentumScoreMappings(MomentumMetric.Ratio),
  ...createMomentumScoreMappings(MomentumMetric.RSD),

  // Bonus mappings
  ...createMomentumBonusMappings(),

  // Penalty mappings
  ...createMomentumPenaltyMappings(),
];

/**
 * Create parameter converter
 */
export const { paramsToConfig } = createParamConverter<
  MomentumConfig,
  GenericFlatParams
>(PARAM_MAPPINGS);
