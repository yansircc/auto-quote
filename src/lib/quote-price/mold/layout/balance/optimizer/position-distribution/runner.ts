import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { OptimizationProgressBar } from "../utils/progress-bar";
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

  return OptimizationProgressBar.runWithProgress<
    PositionInput,
    PositionConfig,
    FlatParams
  >({
    taskName: "位置分布",
    iterations,
    optimizeFunc: findBestConfig,
    onComplete: (result) => {
      reporter.generateReport({
        previousScores: result.previousScores,
        bestScores: result.scores,
        bestParams: result.params,
      });
    },
  });
}

export { runPositionDistributionOptimizer };
