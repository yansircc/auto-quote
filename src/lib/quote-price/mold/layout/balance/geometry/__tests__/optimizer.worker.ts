import { parentPort } from "worker_threads";
import { LayeredOptimizer, PARAM_RANGES } from "../optimizer";
import { runBalanceTests } from "./test-runner";
import type {
  WorkerMessage,
  OptimizationResult,
  OptimizerConfig,
} from "./worker-types";

if (!parentPort) {
  throw new Error("This file must be run as a worker");
}

async function runOptimization(
  optimizerConfig: OptimizerConfig,
): Promise<OptimizationResult> {
  try {
    const optimizer = new LayeredOptimizer(PARAM_RANGES, optimizerConfig);
    const bestConfig = await optimizer.optimize((progress) => {
      parentPort?.postMessage({
        type: "progress",
        data: progress.message,
      } as WorkerMessage);
    });

    const results = runBalanceTests(bestConfig);

    // 计算平均分和通过率
    const totalScore = results.reduce((sum, r) => sum + r.actualScore, 0);
    const avgScore = totalScore / results.length;
    const passRate =
      (results.filter((r) => r.success).length / results.length) * 100;

    return {
      config: bestConfig,
      results,
      avgScore,
      passRate,
    };
  } catch (error) {
    console.error("Worker optimization error:", error);
    throw error;
  }
}

// 使用 void 来忽略 Promise
parentPort.on("message", (optimizerConfig: OptimizerConfig) => {
  void runOptimization(optimizerConfig)
    .then((result) => {
      parentPort?.postMessage({
        type: "result",
        data: result,
      } as WorkerMessage);
    })
    .catch((error) => {
      console.error("Worker error:", error);
      parentPort?.postMessage({
        type: "error",
        data: error instanceof Error ? error.message : String(error),
      } as WorkerMessage);
    });
});
