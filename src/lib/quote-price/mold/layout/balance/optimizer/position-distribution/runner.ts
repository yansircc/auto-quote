import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { PositionInput, PositionConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: PositionConfig;
  scores: ConfigScores<PositionInput>;
  previousScores: ConfigScores<PositionInput>;
}

/**
 * 测试位置分布优化器性能
 */
async function runPositionDistributionOptimizer(
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

export { runPositionDistributionOptimizer };
