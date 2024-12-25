// Core exports
export type {
  RelativeRange,
  ParamRange,
  OrderedParamGroup,
  SumConstrainedGroup,
  OptimizerConfig,
} from "./core/types";
export { validateAllConstraints } from "./core/validator";
export { ParameterGenerator } from "./core/generator";

// Genetic algorithm exports
export type { GeneticConfig, GeneticResult } from "./genetic/types";
export { GeneticOptimizer } from "./genetic/optimizer";

// Utility exports
export {
  relativeToAbsolute,
  generateRandomInRange,
  mutateValueInRange,
  clampToRange,
  calculateOverlap,
} from "./utils/range-utils";
