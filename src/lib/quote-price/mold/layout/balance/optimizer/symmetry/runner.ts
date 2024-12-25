import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { OptimizationProgressBar } from "../utils/progress-bar";
import type { SymmetryInput, SymmetryConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: SymmetryConfig;
  scores: ConfigScores<SymmetryInput>;
  previousScores: ConfigScores<SymmetryInput>;
}

/**
 * 测试对称性优化器性能
 */
async function runSymmetryOptimizer(
  iterations = 1,
): Promise<OptimizationResult> {
  const reporter = new ScoreReporter();

  return OptimizationProgressBar.runWithProgress<
    SymmetryInput,
    SymmetryConfig,
    FlatParams
  >({
    taskName: "对称性",
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

export { runSymmetryOptimizer };
