import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SpacingInput, SpacingConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: SpacingConfig;
  scores: ConfigScores<SpacingInput>;
  previousScores: ConfigScores<SpacingInput>;
}

/**
 * 测试间距均匀性优化器性能
 */
async function runSpacingUniformityOptimizer(
  iterations = 1,
): Promise<OptimizationResult> {
  const reporter = new ScoreReporter();

  const result = await findBestConfig(iterations);

  reporter.generateReport({
    previousScores: result.previousScores,
    bestScores: result.scores,
    bestParams: result.params,
  });

  return result;
}

export { runSpacingUniformityOptimizer };
