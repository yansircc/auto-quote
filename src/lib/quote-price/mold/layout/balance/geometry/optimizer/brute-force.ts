import type { GeometricConfig } from "../types";
import type {
  Range,
  ConfigRange,
  WorkerResult,
  OptimizerProgress,
} from "./types";
import { DEFAULT_CONFIG } from "../constants";
import { CONFIG_RANGES } from "./optimizer-config";
import { runBalanceTests } from "../__tests__/test-runner";
import type cliProgress from "cli-progress";

function isRange(value: unknown): value is Range {
  return (
    typeof value === "object" &&
    value !== null &&
    "min" in value &&
    "max" in value &&
    "step" in value
  );
}

function isConfigRange(value: unknown): value is ConfigRange {
  return typeof value === "object" && value !== null && !isRange(value);
}

function getWeightsRange(): Range {
  const weights = CONFIG_RANGES.weights;
  if (!weights || !isConfigRange(weights)) {
    throw new Error("Invalid configuration: weights is not properly defined");
  }
  const volumeRange = weights.volume;
  if (!volumeRange || !isRange(volumeRange)) {
    throw new Error(
      "Invalid configuration: weights.volume is not properly defined",
    );
  }
  return volumeRange;
}

/**
 * 生成所有可能的权重组合
 */
function* generateWeightCombinations(
  progressBar: cliProgress.SingleBar | null,
  stats: { total: number; valid: number },
): Generator<number[]> {
  const range = getWeightsRange();
  // 只生成前三个权重，最后一个用1减去前三个的和
  for (let w1 = range.min; w1 <= range.max; w1 += range.step) {
    for (let w2 = range.min; w2 <= range.max; w2 += range.step) {
      for (let w3 = range.min; w3 <= range.max; w3 += range.step) {
        const sum = w1 + w2 + w3;
        if (sum < 1) {
          const w4 = Number((1 - sum).toFixed(4));
          if (w4 >= range.min && w4 <= range.max) {
            stats.valid++;
            yield [w1, w2, w3, w4];
          }
        }
        stats.total++;
        if (progressBar) {
          progressBar.update(stats.total, { validConfigs: stats.valid });
        }
      }
    }
  }
}

/**
 * 递归生成所有可能的配置组合
 */
function* generateConfigRecursive(
  path: string[],
  currentConfig: GeometricConfig,
  progressBar: cliProgress.SingleBar | null,
  stats: { total: number; valid: number },
): Generator<GeometricConfig> {
  // 特殊处理权重
  if (path.length === 0) {
    for (const weights of generateWeightCombinations(progressBar, stats)) {
      const newConfig = structuredClone(currentConfig);
      if (
        newConfig.weights &&
        Array.isArray(weights) &&
        weights.length === 4 &&
        weights.every((w) => typeof w === "number")
      ) {
        newConfig.weights.volume = weights[0]!;
        newConfig.weights.aspectRatio = weights[1]!;
        newConfig.weights.shapeSimilarity = weights[2]!;
        newConfig.weights.dimensionalConsistency = weights[3]!;
        yield* generateConfigRecursive(
          ["volume"],
          newConfig,
          progressBar,
          stats,
        );
      }
    }
    return;
  }

  // 找到当前路径对应的范围配置
  let range: unknown = CONFIG_RANGES;
  for (const key of path) {
    if (isConfigRange(range)) {
      range = range[key];
    } else {
      return;
    }
  }

  // 如果是叶子节点（有范围定义），生成该参数的所有可能值
  if (isRange(range)) {
    const { min, max, step } = range;
    const values = [];
    for (let value = min; value <= max + step / 2; value += step) {
      values.push(Number(value.toFixed(4)));
    }

    for (const value of values) {
      const newConfig = structuredClone(currentConfig);
      let target: Record<string, unknown> = newConfig;

      // 构建嵌套对象
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key === undefined) continue;
        if (!(key in target)) {
          target[key] = {};
        }
        const nextTarget = target[key];
        if (typeof nextTarget === "object" && nextTarget !== null) {
          target = nextTarget as Record<string, unknown>;
        } else {
          return;
        }
      }

      const lastKey = path[path.length - 1];
      if (lastKey !== undefined) {
        target[lastKey] = value;
        yield newConfig;
      }
    }
  } else {
    // 如果是中间节点，递归处理所有子节点
    if (isConfigRange(range)) {
      for (const key of Object.keys(range)) {
        yield* generateConfigRecursive(
          [...path, key],
          currentConfig,
          progressBar,
          stats,
        );
      }
    }
  }
}

/**
 * 评估配置的适应度
 */
function evaluateConfig(config: GeometricConfig): number {
  const results = runBalanceTests(config);
  let totalScore = 0;
  let minScore = Infinity;
  let maxScore = -Infinity;

  for (const result of results) {
    const score = result.success
      ? 100
      : result.deviation
        ? 50 - result.deviation
        : 0;

    totalScore += score;
    minScore = Math.min(minScore, score);
    maxScore = Math.max(maxScore, score);
  }

  // 平均分
  const avgScore = totalScore / results.length;

  // 稳定性惩罚（分数波动大的配置得分会降低）
  const stabilityPenalty = (maxScore - minScore) * 0.1;

  // 最终得分 = 平均分 - 稳定性惩罚
  return Math.max(0, avgScore - stabilityPenalty);
}

/**
 * 单线程暴力搜索
 */
export function bruteForceSearchSingleThread(
  baseConfig: GeometricConfig,
  onProgress?: (progress: OptimizerProgress) => void,
): {
  bestConfig: GeometricConfig;
  bestScore: number;
  totalConfigs: number;
} {
  try {
    const config = { ...DEFAULT_CONFIG, ...baseConfig };
    const stats = { total: 0, valid: 0 };
    let bestConfig: GeometricConfig | null = null;
    let bestScore = -Infinity;
    let lastProgressUpdate = Date.now();
    const progressInterval = 100; // 每100ms更新一次进度

    // 预计算总配置数
    const estimatedTotal = 1000; // 暂时使用一个固定值，后续可以根据范围计算

    // 进度报告函数
    const reportProgress = (message: string, bestScore?: number) => {
      onProgress?.({
        phase: "bruteforce",
        currentStep: stats.total,
        totalSteps: estimatedTotal,
        bestScore,
        message,
      });
    };

    // 生成所有可能的配置
    for (const currentConfig of generateConfigRecursive(
      [],
      config,
      null,
      stats,
    )) {
      stats.total++;

      try {
        // 评估当前配置
        const score = evaluateConfig(currentConfig);

        // 更新最佳配置
        if (score > bestScore) {
          bestScore = score;
          bestConfig = structuredClone(currentConfig);
        }

        // 控制进度更新频率
        const now = Date.now();
        if (now - lastProgressUpdate >= progressInterval) {
          reportProgress(`暴力搜索中...`, bestScore);
          lastProgressUpdate = now;
        }
      } catch (error) {
        console.warn("评估配置时出错:", error);
        continue;
      }
    }

    if (!bestConfig) {
      throw new Error("未能找到有效配置");
    }

    // 确保发送最终进度
    reportProgress(`暴力搜索完成`, bestScore);

    return {
      bestConfig,
      bestScore,
      totalConfigs: stats.total,
    };
  } catch (error) {
    throw new Error(
      `暴力搜索失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Worker线程的处理函数
 */
export function workerHandler(
  config: GeometricConfig,
): WorkerResult<GeometricConfig> {
  try {
    const score = evaluateConfig(config);
    return { success: true, result: { config, score } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
