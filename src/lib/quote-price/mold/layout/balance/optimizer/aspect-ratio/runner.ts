import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { RatioInput, AspectRatioConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: AspectRatioConfig;
  scores: ConfigScores<RatioInput>;
  previousScores: ConfigScores<RatioInput>;
}

/**
 * 测试长宽比优化器性能
 */
async function runAspectRatioOptimizer(
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

export { runAspectRatioOptimizer };
