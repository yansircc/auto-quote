import chalk from "chalk";
import cliProgress from "cli-progress";
import type { ConfigScores } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult<TInput, TConfig, TParams> {
  params: TParams;
  config: TConfig;
  scores: ConfigScores<TInput>;
  previousScores: ConfigScores<TInput>;
}

/**
 * 优化进度条管理器
 */
export class OptimizationProgressBar {
  private progressBar: cliProgress.SingleBar;
  private taskName: string;

  constructor(taskName: string) {
    this.taskName = taskName;
    this.progressBar = new cliProgress.SingleBar(
      {
        format: `${taskName}优化进度 |${chalk.cyan("{bar}")}| {percentage}% | {value}/{total} | 最佳分数: {bestScore}`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    );
  }

  /**
   * 启动进度条
   */
  start(totalIterations: number): void {
    this.progressBar.start(totalIterations, 0, { bestScore: "0.00" });
  }

  /**
   * 更新进度条
   */
  update(currentIteration: number, bestScore: number): void {
    this.progressBar.update(currentIteration, {
      bestScore: bestScore.toFixed(2),
    });
  }

  /**
   * 停止进度条
   */
  stop(): void {
    this.progressBar.stop();
  }

  /**
   * 运行优化任务并显示进度
   */
  static async runWithProgress<TInput, TConfig, TParams>({
    taskName,
    iterations,
    optimizeFunc,
    onComplete,
    onError,
  }: {
    taskName: string;
    iterations: number;
    optimizeFunc: (
      iteration: number,
    ) => Promise<OptimizationResult<TInput, TConfig, TParams>>;
    onComplete?: (result: OptimizationResult<TInput, TConfig, TParams>) => void;
    onError?: (error: unknown) => void;
  }): Promise<OptimizationResult<TInput, TConfig, TParams>> {
    const progressBar = new OptimizationProgressBar(taskName);
    let bestResult: OptimizationResult<TInput, TConfig, TParams> | null = null;
    let bestScore = -Infinity;

    try {
      console.log(chalk.cyan(`开始${taskName}优化，迭代次数: ${iterations}`));
      progressBar.start(iterations);

      for (let i = 0; i < iterations; i++) {
        const result = await optimizeFunc(1);

        if (result.scores.avgScore > bestScore) {
          bestResult = result;
          bestScore = result.scores.avgScore;
        }

        progressBar.update(i + 1, bestScore);
      }

      progressBar.stop();

      if (!bestResult) {
        throw new Error(`${taskName}优化失败：未能找到有效结果`);
      }

      console.log(chalk.green(`\n${taskName}优化完成！`));
      onComplete?.(bestResult);

      return bestResult;
    } catch (error) {
      progressBar.stop();
      console.error(chalk.red(`${taskName}优化过程出错:`), error);
      onError?.(error);
      throw error;
    }
  }
}
