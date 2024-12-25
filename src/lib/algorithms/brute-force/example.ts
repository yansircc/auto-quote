import { bruteForceSearch } from "./index";
import type {
  BruteForceConfig,
  BruteForceEvent,
  Point2DParameterSpace,
} from "./types";
import cliProgress from "cli-progress";

interface Point2D {
  x: number;
  y: number;
}

/**
 * 计算参数范围内的步数
 */
function calculateSteps(min: number, max: number, step: number): number {
  return Math.floor((max - min) / step) + 1;
}

/**
 * 一个简单的测试用例：找到函数 f(x,y) = -(x^2 + y^2) 的最大值
 * 理论上最大值在 (0,0) 点，值为 0
 */
async function testBruteForce() {
  // 创建进度条
  const progressBar = new cliProgress.SingleBar({
    format:
      "Progress |{bar}| {percentage}% | {currentStep}/{totalSteps} | ETA: {eta}s | {validConfigs} valid",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  const parameterSpace: Point2DParameterSpace = {
    x: { min: -10, max: 10, step: 0.5 },
    y: { min: -10, max: 10, step: 0.5 },
  };

  const config: BruteForceConfig<Point2D> = {
    parameterSpace,

    // 评估函数：计算 -(x^2 + y^2)
    evaluateConfig: (p: Point2D) => -(p.x * p.x + p.y * p.y),

    // 配置验证（可选）
    validateConfig: (p: Point2D) => {
      // 例如：限制在圆形区域内
      return p.x * p.x + p.y * p.y <= 100;
    },

    // 终止条件
    terminationCondition: {
      minScore: -0.01, // 非常接近理论最大值 0
      maxTime: 60000, // 最多运行 1 分钟
    },

    // 回调函数
    callbacks: {
      onEvaluation: (event: BruteForceEvent<Point2D>) => {
        if (event.currentStep % 100 === 0) {
          // 每 100 步打印一次
          console.log(
            `当前得分: ${event.currentScore.toFixed(4)},`,
            `最佳得分: ${event.bestScore.toFixed(4)}`,
          );
        }
      },

      onNewBest: (config: Point2D, score: number) => {
        console.log(
          "\n找到新的最优解:",
          `(${config.x.toFixed(4)}, ${config.y.toFixed(4)})`,
          `得分 = ${score.toFixed(4)}`,
        );
      },

      onComplete: (config, score, stats) => {
        progressBar.stop();
        console.log("\n搜索完成:");
        console.log("最佳配置:", config);
        console.log("最佳得分:", score);
        console.log("统计信息:");
        console.log("- 总配置数:", stats.totalConfigs);
        console.log("- 有效配置:", stats.validConfigs);
        console.log("- 无效配置:", stats.invalidConfigs);
        console.log("- 耗时:", (stats.endTime - stats.startTime) / 1000, "秒");
      },

      onError: (error, config) => {
        console.error("\n评估配置出错:", error.message);
        console.error("问题配置:", config);
      },

      onProgress: (progress) => {
        progressBar.update(progress.currentStep, {
          percentage: (progress.progress * 100).toFixed(1),
          currentStep: progress.currentStep,
          totalSteps: progress.totalSteps,
          eta: Math.ceil(progress.estimatedTimeRemaining / 1000),
          validConfigs: progress.validConfigs,
        });
      },
    },
  };

  try {
    // 计算总步数
    const xSteps = calculateSteps(
      parameterSpace.x.min,
      parameterSpace.x.max,
      parameterSpace.x.step,
    );
    const ySteps = calculateSteps(
      parameterSpace.y.min,
      parameterSpace.y.max,
      parameterSpace.y.step,
    );
    const totalSteps = xSteps * ySteps;

    // 启动进度条
    progressBar.start(totalSteps, 0);

    const result = await bruteForceSearch(config);
    console.log("\n搜索空间信息:");
    console.log("- 维度:", result.searchSpace.dimensions);
    console.log("- 大小:", result.searchSpace.size);
  } catch (error) {
    progressBar.stop();
    console.error(
      "搜索失败:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

// 运行测试
void testBruteForce();
// bun run src/lib/quote-price/mold/layout/balance/flow/algorithms/brute-force/example.ts
