import type {
  BruteForceConfig,
  BruteForceResult,
  ParameterRange,
  ParameterSpace,
  SearchStats,
} from "./types";

// 常量配置
const MAX_CONFIGS = 10_000_000; // 最大配置数量：1000万
const MAX_CALC_TIME = 5000; // 计算搜索空间的最大时间：5秒

/**
 * 判断是否为参数范围
 */
function isParameterRange(value: unknown): value is ParameterRange {
  return (
    typeof value === "object" &&
    value !== null &&
    "min" in value &&
    "max" in value &&
    "step" in value &&
    typeof value.min === "number" &&
    typeof value.max === "number" &&
    typeof value.step === "number"
  );
}

/**
 * 生成参数空间中所有可能的配置
 */
function* generateConfigurations<T>(
  parameterSpace: ParameterSpace,
  baseConfig: Partial<T> = {},
  path: string[] = [],
): Generator<T> {
  const entries = Object.entries(parameterSpace);
  if (entries.length === 0) {
    yield baseConfig as T;
    return;
  }

  const [currentEntry, ...remainingEntries] = entries;
  if (!currentEntry) {
    yield baseConfig as T;
    return;
  }

  const [key, range] = currentEntry;
  const remainingSpace = Object.fromEntries(remainingEntries);

  if (isParameterRange(range)) {
    for (let value = range.min; value <= range.max; value += range.step) {
      const newConfig = { ...baseConfig };
      setNestedValue(newConfig, [...path, key], value);
      yield* generateConfigurations(remainingSpace, newConfig, path);
    }
  } else if (typeof range === "object" && range !== null) {
    yield* generateConfigurations(range, baseConfig, [...path, key]);
  }
}

/**
 * 设置嵌套对象的值
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): void {
  let current = obj;
  const lastKey = path[path.length - 1];

  if (!lastKey) {
    throw new Error("Invalid path: empty path");
  }

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!key) continue;

    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * 计算参数空间大小，带超时检查
 */
function calculateSearchSpace(
  parameterSpace: ParameterSpace,
  startTime = Date.now(),
): { size: number; dimensions: number } {
  let size = 1;
  let dimensions = 0;

  function traverse(space: ParameterSpace): void {
    // 检查是否超时
    if (Date.now() - startTime > MAX_CALC_TIME) {
      throw new Error(`计算搜索空间大小超时 (${MAX_CALC_TIME}ms)`);
    }

    for (const value of Object.values(space)) {
      if (isParameterRange(value)) {
        dimensions++;
        const steps = Math.floor((value.max - value.min) / value.step) + 1;

        // 检查每个维度的大小
        if (steps <= 0) {
          throw new Error(
            `无效的参数范围: min=${value.min}, max=${value.max}, step=${value.step}`,
          );
        }

        // 检查是否会导致整数溢出
        if (size > Number.MAX_SAFE_INTEGER / steps) {
          throw new Error("搜索空间过大，可能导致整数溢出");
        }

        size *= steps;

        // 检查总配置数是否超过限制
        if (size > MAX_CONFIGS) {
          throw new Error(
            `搜索空间过大 (${size} > ${MAX_CONFIGS})，请减小参数范围或增加步长`,
          );
        }
      } else {
        traverse(value);
      }
    }
  }

  traverse(parameterSpace);

  if (dimensions === 0) {
    throw new Error("搜索空间中没有有效的参数范围");
  }

  return { size, dimensions };
}

/**
 * 计算预计剩余时间
 */
function calculateEstimatedTimeRemaining(
  startTime: number,
  progress: number,
): number {
  const elapsedTime = Date.now() - startTime;
  if (progress <= 0) return Infinity;
  const estimatedTotalTime = elapsedTime / progress;
  return Math.max(0, estimatedTotalTime - elapsedTime);
}

/**
 * 执行暴力搜索
 */
export async function bruteForceSearch<T>(
  config: BruteForceConfig<T>,
): Promise<BruteForceResult<T>> {
  const {
    parameterSpace,
    baseConfig = {} as Partial<T>,
    evaluateConfig,
    validateConfig,
    callbacks,
    terminationCondition,
  } = config;

  // 首先计算搜索空间大小，这会进行安全性检查
  const searchSpace = calculateSearchSpace(parameterSpace);

  const stats: SearchStats = {
    totalConfigs: searchSpace.size,
    evaluatedConfigs: 0,
    validConfigs: 0,
    invalidConfigs: 0,
    startTime: Date.now(),
    endTime: 0,
  };

  let bestConfig: T | null = null;
  let bestScore = -Infinity;
  let lastProgressUpdate = 0;
  const PROGRESS_UPDATE_INTERVAL = 100; // 每100ms更新一次进度

  try {
    for (const currentConfig of generateConfigurations(
      parameterSpace,
      baseConfig,
    )) {
      // 检查终止条件
      if (terminationCondition) {
        const { maxTime, maxEvaluations, minScore } = terminationCondition;

        if (maxTime && Date.now() - stats.startTime > maxTime) {
          throw new Error(`搜索超时 (${maxTime}ms)`);
        }

        if (maxEvaluations && stats.evaluatedConfigs >= maxEvaluations) {
          throw new Error(`达到最大评估次数 (${maxEvaluations})`);
        }

        if (minScore && bestScore >= minScore) {
          break;
        }
      }

      // 验证配置
      if (validateConfig && !validateConfig(currentConfig)) {
        stats.invalidConfigs++;

        // 更新进度
        const now = Date.now();
        if (
          callbacks?.onProgress &&
          now - lastProgressUpdate >= PROGRESS_UPDATE_INTERVAL
        ) {
          const progress =
            (stats.evaluatedConfigs + stats.invalidConfigs) /
            stats.totalConfigs;
          void callbacks.onProgress({
            progress,
            currentStep: stats.evaluatedConfigs + stats.invalidConfigs,
            totalSteps: stats.totalConfigs,
            evaluatedConfigs: stats.evaluatedConfigs,
            validConfigs: stats.validConfigs,
            invalidConfigs: stats.invalidConfigs,
            elapsedTime: now - stats.startTime,
            estimatedTimeRemaining: calculateEstimatedTimeRemaining(
              stats.startTime,
              progress,
            ),
          });
          lastProgressUpdate = now;
        }
        continue;
      }

      try {
        // 评估配置
        const score = await evaluateConfig(currentConfig);
        stats.evaluatedConfigs++;
        stats.validConfigs++;

        // 更新最佳配置
        if (score > bestScore) {
          bestScore = score;
          bestConfig = structuredClone(currentConfig);
          void callbacks?.onNewBest?.(currentConfig, score);
        }

        // 触发评估回调
        void callbacks?.onEvaluation?.({
          currentConfig,
          currentScore: score,
          bestConfig: bestConfig as T,
          bestScore,
          progress: stats.evaluatedConfigs / stats.totalConfigs,
          totalConfigs: stats.totalConfigs,
          currentStep: stats.evaluatedConfigs,
        });

        // 更新进度
        const now = Date.now();
        if (
          callbacks?.onProgress &&
          now - lastProgressUpdate >= PROGRESS_UPDATE_INTERVAL
        ) {
          const progress =
            (stats.evaluatedConfigs + stats.invalidConfigs) /
            stats.totalConfigs;
          void callbacks.onProgress({
            progress,
            currentStep: stats.evaluatedConfigs + stats.invalidConfigs,
            totalSteps: stats.totalConfigs,
            evaluatedConfigs: stats.evaluatedConfigs,
            validConfigs: stats.validConfigs,
            invalidConfigs: stats.invalidConfigs,
            elapsedTime: now - stats.startTime,
            estimatedTimeRemaining: calculateEstimatedTimeRemaining(
              stats.startTime,
              progress,
            ),
          });
          lastProgressUpdate = now;
        }
      } catch (error) {
        stats.invalidConfigs++;
        void callbacks?.onError?.(
          error instanceof Error ? error : new Error(String(error)),
          currentConfig,
        );
      }
    }

    stats.endTime = Date.now();

    if (!bestConfig) {
      throw new Error("未找到有效配置");
    }

    // 最后一次更新进度
    if (callbacks?.onProgress) {
      void callbacks.onProgress({
        progress: 1,
        currentStep: stats.evaluatedConfigs + stats.invalidConfigs,
        totalSteps: stats.totalConfigs,
        evaluatedConfigs: stats.evaluatedConfigs,
        validConfigs: stats.validConfigs,
        invalidConfigs: stats.invalidConfigs,
        elapsedTime: stats.endTime - stats.startTime,
        estimatedTimeRemaining: 0,
      });
    }

    // 触发完成回调
    void callbacks?.onComplete?.(bestConfig, bestScore, stats);

    return {
      bestConfig,
      bestScore,
      stats,
      searchSpace,
    };
  } catch (error) {
    stats.endTime = Date.now();
    throw error;
  }
}
