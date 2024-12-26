import Table from "cli-table3";
import chalk from "chalk";
import type { ConfigScores, FlatParams } from "../types";

interface ReportInput<TInput> {
  previousScores: ConfigScores<TInput>;
  bestScores: ConfigScores<TInput>;
  bestParams: FlatParams;
}

/**
 * 分数报告生成器
 * @description 用于生成优化前后的分数变化报告
 */
export class ScoreReporter {
  private colorizeScore(score: number, min: number, max: number): string {
    if (score >= min && score <= max) {
      return chalk.green(score.toFixed(2));
    }
    return chalk.red(score.toFixed(2));
  }

  private createTable(): Table.Table {
    return new Table({
      head: ["测试用例", "优化前", "优化后", "适应度", "期望范围"],
      style: {
        head: ["cyan"],
        border: ["grey"],
      },
      chars: {
        top: "═",
        "top-mid": "╤",
        "top-left": "╔",
        "top-right": "╗",
        bottom: "═",
        "bottom-mid": "╧",
        "bottom-left": "╚",
        "bottom-right": "╝",
        left: "║",
        "left-mid": "╟",
        mid: "─",
        "mid-mid": "┼",
        right: "║",
        "right-mid": "╢",
        middle: "│",
      },
    });
  }

  /**
   * 计算并格式化分数变化
   */
  private formatScoreChange(
    previousScore: {
      actual: number;
      fitness: number;
      expect: { min?: number; max?: number };
    },
    currentScore: {
      actual: number;
      fitness: number;
      expect: { min?: number; max?: number };
    },
  ): string {
    // 计算适应度变化
    const fitnessChange = currentScore.fitness - previousScore.fitness;

    // 使用固定基数100来计算百分比，而不是使用之前的分数作为基数
    const fitnessChangePercentage = fitnessChange; // 直接使用分数差作为百分比

    // 确定方向符号（基于适应度变化）
    const directionSymbol =
      fitnessChange > 0 ? " ↑" : fitnessChange < 0 ? " ↓" : " →";

    // 格式化变化文本（使用适应度变化）
    const changeText = `${fitnessChangePercentage >= 0 ? "+" : ""}${Math.abs(fitnessChangePercentage).toFixed(1)}%`;

    // 如果适应度有显著变化
    if (Math.abs(fitnessChange) > 0.01) {
      // 检查当前值是否在期望范围内
      const isInRange =
        currentScore.actual >= (currentScore.expect.min ?? 0) &&
        currentScore.actual <= (currentScore.expect.max ?? 100);

      if (fitnessChange > 0) {
        // 如果适应度提升但仍未达到期望范围，显示橙色
        return isInRange
          ? chalk.green(changeText + directionSymbol)
          : chalk.yellow(changeText + directionSymbol);
      } else {
        return chalk.red(changeText + directionSymbol);
      }
    }

    // 如果适应度相同但实际分数有变化，使用灰色
    if (Math.abs(fitnessChange) <= 0.01) {
      return chalk.gray("+0.0% →");
    }

    return chalk.gray(changeText + directionSymbol);
  }

  /**
   * 生成优化报告
   */
  generateReport<TInput>({
    previousScores,
    bestScores,
    bestParams,
  }: ReportInput<TInput>): void {
    // 计算整体适应度提升
    const avgFitnessImprovement =
      previousScores.scores.reduce((sum, score) => sum + score.fitness, 0) /
      previousScores.scores.length;
    const bestFitnessImprovement =
      bestScores.scores.reduce((sum, score) => sum + score.fitness, 0) /
      bestScores.scores.length;

    const fitnessImprovement =
      avgFitnessImprovement === 0
        ? Infinity
        : ((bestFitnessImprovement - avgFitnessImprovement) /
            avgFitnessImprovement) *
          100;

    // 输出整体分数变化
    console.log("\n整体适应度变化:");
    const scoreChangeText =
      avgFitnessImprovement === 0
        ? `0.00 → ${bestFitnessImprovement.toFixed(2)} (+∞%)`
        : `${avgFitnessImprovement.toFixed(2)} → ${bestFitnessImprovement.toFixed(2)} ` +
          `(${fitnessImprovement >= 0 ? "+" : ""}${Number.isFinite(fitnessImprovement) ? fitnessImprovement.toFixed(2) : "∞"}%)`;
    console.log(scoreChangeText);

    // 创建表格
    const table = this.createTable();

    // 填充测试用例数据
    previousScores.scores.forEach((previousScore) => {
      const bestScore = bestScores.scores.find(
        (score) => score.description === previousScore.description,
      );
      if (!bestScore) return;

      const coloredChange = this.formatScoreChange(previousScore, bestScore);

      // 获取期望范围，提��默认值
      const minScore = previousScore.expect.min ?? 0;
      const maxScore = previousScore.expect.max ?? 100;

      table.push([
        previousScore.description,
        this.colorizeScore(previousScore.actual, minScore, maxScore),
        this.colorizeScore(bestScore.actual, minScore, maxScore),
        coloredChange,
        `${minScore}-${maxScore}`,
      ] as Table.Cell[]);
    });

    console.log("\n=== 测试用例评分对比 ===");
    console.log(table.toString());

    // 如果有提升，输出最佳参数
    if (fitnessImprovement > 0 || !Number.isFinite(fitnessImprovement)) {
      console.log("\n最佳配置参数:");
      console.log(bestParams);
    }
  }
}
