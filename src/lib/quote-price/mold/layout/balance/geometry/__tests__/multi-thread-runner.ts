import { Worker } from "worker_threads";
import path from "path";
import type {
  WorkerMessage,
  OptimizationResult,
  OptimizerConfig,
} from "./worker-types";
import type { TestResult } from "./test-runner";
import cliProgress from "cli-progress";

export class MultiThreadTestRunner {
  private multibar: cliProgress.MultiBar;

  constructor(
    private threadCount: number,
    private optimizerConfig: OptimizerConfig = {
      baseWeights: {
        populationSize: 500,
        generations: 100,
      },
      detailParams: {
        searchRadius: 0.9,
        stepScale: 0.01,
      },
    },
  ) {
    this.multibar = new cliProgress.MultiBar({
      format: "[{bar}] {percentage}% | {value}/{total} | {state}",
      clearOnComplete: false,
      hideCursor: true,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      stopOnComplete: true,
    });
  }

  private createWorker(): Worker {
    const workerPath = path.resolve(__dirname, "optimizer.worker.ts");
    return new Worker(workerPath);
  }

  private runWorker(
    worker: Worker,
    progressBar: cliProgress.SingleBar,
  ): Promise<OptimizationResult> {
    return new Promise((resolve, reject) => {
      worker.on("message", (message: WorkerMessage) => {
        switch (message.type) {
          case "progress":
            const [phase, current, total, score] = message.data
              .split("|")
              .map((s) => s.trim());
            const currentValue = parseInt(current ?? "0");
            const totalValue = parseInt(total ?? "100");

            if (!isNaN(currentValue) && !isNaN(totalValue)) {
              progressBar.setTotal(totalValue);
              progressBar.update(currentValue, {
                state: `${phase ?? "优化中"} - 最高分: ${score ?? "0"}`,
              });
            }
            break;
          case "result":
            progressBar.update(100); // 确保进度条完成
            resolve(message.data);
            break;
          case "error":
            reject(new Error(message.data));
            break;
        }
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      worker.postMessage(this.optimizerConfig);
    });
  }

  async runMultiThreaded(): Promise<OptimizationResult> {
    console.log(`启动 ${this.threadCount} 个优化实例...\n`);

    // 创建多个 worker 实例
    const workers = Array(this.threadCount)
      .fill(0)
      .map(() => this.createWorker());

    // 为每个 worker 创建进度条
    const progressBars = workers.map((_, i) =>
      this.multibar.create(100, 0, { state: `实例 ${i + 1} 初始化...` }),
    );

    try {
      // 等待所有 worker 完成
      const results = await Promise.all(
        workers.map((worker, i) => {
          const progressBar = progressBars[i];
          if (!progressBar) {
            throw new Error(`无法为 worker ${i} 创建进度条`);
          }
          return this.runWorker(worker, progressBar);
        }),
      );

      if (results.length === 0) {
        throw new Error("没有优化实例完成运行");
      }

      // 找到最佳结果
      const bestResult = results.reduce((best, current) => {
        if (best.passRate < current.passRate) {
          return current;
        }
        if (
          best.passRate === current.passRate &&
          best.avgScore < current.avgScore
        ) {
          return current;
        }
        return best;
      });

      // 停止所有进度条并清理
      this.multibar.stop();
      console.clear(); // 清屏以确保输出干净

      // 计算通过测试的数量
      const totalTests = bestResult.results.length;
      const passedTests = bestResult.results.filter(
        (test: TestResult) => test.success,
      ).length;

      // 输出最佳结果
      console.log("\n最佳结果：", {
        通过率: `${bestResult.passRate.toFixed(1)}% (${passedTests}/${totalTests})`,
        平均分: bestResult.avgScore.toFixed(2),
      });

      // 格式化配置对象
      const formatConfig = (
        obj: Record<string, unknown>,
      ): Record<string, unknown> => {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === "number") {
            // 对数值进行四舍五入，保留2位小数
            result[key] = Number(value.toFixed(2));
          } else if (typeof value === "object" && value !== null) {
            result[key] = formatConfig(value as Record<string, unknown>);
          } else {
            result[key] = value;
          }
        }
        return result;
      };

      console.log("\n最佳配置：");
      const formattedConfig = formatConfig(
        bestResult.config as Record<string, unknown>,
      );
      console.log(JSON.stringify(formattedConfig, null, 2));

      return bestResult;
    } finally {
      // 确保所有 worker 都被终止
      workers.forEach((worker) => void worker.terminate());
    }
  }
}
