import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { OptimizationProgressBar } from "../utils/progress-bar";
import type { ShapeInput, ShapeConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: ShapeConfig;
  scores: ConfigScores<ShapeInput>;
  previousScores: ConfigScores<ShapeInput>;
}

/**
 * 测试形状相似度优化器性能
 */
async function runShapeSimilarityOptimizer(
  iterations = 1,
): Promise<OptimizationResult> {
  const reporter = new ScoreReporter();

  return OptimizationProgressBar.runWithProgress<
    ShapeInput,
    ShapeConfig,
    FlatParams
  >({
    taskName: "形状相似度",
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

export { runShapeSimilarityOptimizer };
