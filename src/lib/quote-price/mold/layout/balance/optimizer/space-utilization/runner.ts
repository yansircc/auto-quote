import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { OptimizationProgressBar } from "../utils/progress-bar";
import type { SpaceInput, SpaceConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: SpaceConfig;
  scores: ConfigScores<SpaceInput>;
  previousScores: ConfigScores<SpaceInput>;
}

/**
 * 测试空间利用率优化器性能
 */
async function runSpaceUtilizationOptimizer(
  iterations = 1,
): Promise<OptimizationResult> {
  const reporter = new ScoreReporter();

  return OptimizationProgressBar.runWithProgress<
    SpaceInput,
    SpaceConfig,
    FlatParams
  >({
    taskName: "空间利用率",
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

export { runSpaceUtilizationOptimizer };
