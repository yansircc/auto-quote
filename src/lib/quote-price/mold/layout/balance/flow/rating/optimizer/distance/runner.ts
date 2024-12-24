import { findBestConfig } from "./index";
import chalk from "chalk";
import cliProgress from "cli-progress";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { DistanceInput, DistanceConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: DistanceConfig;
  scores: ConfigScores<DistanceInput>;
  previousScores: ConfigScores<DistanceInput>;
}

/**
 * 测试优化器性能
 */
async function runDistanceOptimizer(iterations = 1) {
  try {
    // 创建进度条
    const progressBar = new cliProgress.SingleBar(
      {
        format: `优化进度 |${chalk.cyan("{bar}")}| {percentage}% | {value}/{total} | 最佳分数: {bestScore}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    );

    // 记录最佳结果
    let bestResult: OptimizationResult | null = null;
    let bestScore = -Infinity;

    // 启动进度条
    progressBar.start(iterations, 0, { bestScore: "0.00" });

    // 运行多次优化，找出最佳结果
    for (let i = 0; i < iterations; i++) {
      const result = await findBestConfig(1);

      if (result.scores.avgScore > bestScore) {
        bestResult = result;
        bestScore = result.scores.avgScore;
      }

      progressBar.update(i + 1, { bestScore: bestScore.toFixed(2) });
    }

    // 停止进度条
    progressBar.stop();

    if (!bestResult) {
      throw new Error("优化失败：未能找到有效结果");
    }

    // 输出优化报告
    console.log(chalk.green("\n优化完成！"));
    const reporter = new ScoreReporter();
    reporter.generateReport({
      previousScores: bestResult.previousScores,
      bestScores: bestResult.scores,
      bestParams: bestResult.params,
    });

    return bestResult;
  } catch (error) {
    console.error(chalk.red("优化过程出错:"), error);
    throw error;
  }
}

export { runDistanceOptimizer };
