import type { GeometricConfig } from "../types";
import type { Range, ConfigRange } from "./types";
import { bruteForceSearchSingleThread } from "./brute-force";
import { findBestConfigGenetic } from "./genetic-algorithm";
import { CONFIG_RANGES } from "./optimizer-config";

// 递归的范围类型
export type RecursiveRange = {
  [key: string]: Range | RecursiveRange;
};

interface OptimizeOptions {
  ranges: RecursiveRange;
  baseConfig?: Partial<GeometricConfig>;
  populationSize?: number;
  generations?: number;
  searchRadius?: number;
  stepScale?: number;
  onProgress?: (progress: OptimizerProgress) => void;
}

export interface OptimizerProgress {
  phase: "genetic" | "bruteforce";
  currentStep: number;
  totalSteps: number;
  bestScore?: number;
  message?: string;
}

/**
 * 将嵌套的范围配置展平为一维的范围配置
 */
function flattenRanges(
  ranges: RecursiveRange,
  prefix = "",
): Record<string, Range> {
  const result: Record<string, Range> = {};

  for (const [key, value] of Object.entries(ranges)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if ("min" in value && "max" in value && "step" in value) {
      result[fullKey] = value as Range;
    } else {
      Object.assign(result, flattenRanges(value, fullKey));
    }
  }

  return result;
}

/**
 * 根据基础配置和搜索半径调整范围
 */
function adjustRangesByRadius(
  ranges: RecursiveRange,
  baseConfig: Partial<GeometricConfig>,
  searchRadius: number,
  stepScale = 0.1,
): Record<string, Range> {
  const result: Record<string, Range> = {};
  const flatRanges = flattenRanges(ranges);

  for (const [path, range] of Object.entries(flatRanges)) {
    const baseValue = getValueByPath(baseConfig, path) as number;
    if (typeof baseValue === "number") {
      // 计算新的范围
      const radius = (range.max - range.min) * searchRadius;
      const min = Math.max(range.min, baseValue - radius);
      const max = Math.min(range.max, baseValue + radius);

      // 缩小步长
      const step = range.step * stepScale;

      result[path] = { min, max, step };
    } else {
      // 如果没有基础值，使用原始范围
      result[path] = range;
    }
  }

  return result;
}

/**
 * 根据路径获取对象中的值
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * 将展平的范围转换为优化器配置格式
 */
function convertToOptimizerConfig(
  flatRanges: Record<string, Range>,
): ConfigRange {
  const result: ConfigRange = {};

  // 按照路径重建嵌套结构
  for (const [path, range] of Object.entries(flatRanges)) {
    const parts = path.split(".");
    let current: Record<string, unknown> = result;

    // 创建或访问中间节点
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue; // 跳过空字符串

      if (!(part in current)) {
        current[part] = {};
      }

      const next = current[part];
      if (next && typeof next === "object") {
        current = next as Record<string, unknown>;
      } else {
        // 如果不是对象，创建一个新对象
        current[part] = {};
        current = current[part] as Record<string, unknown>;
      }
    }

    // 设置叶子节点的值
    const lastPart = parts[parts.length - 1];
    if (!lastPart) continue; // 跳过空字符串

    current[lastPart] = range;
  }

  return result;
}

/**
 * 优化器错误类
 */
export class OptimizerError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "OptimizerError";
  }
}

/**
 * 验证范围配置
 */
function validateRanges(ranges: RecursiveRange): void {
  function validate(obj: RecursiveRange | Range, path: string[]): void {
    if ("min" in obj && "max" in obj && "step" in obj) {
      if (
        typeof obj.min !== "number" ||
        typeof obj.max !== "number" ||
        typeof obj.step !== "number"
      ) {
        throw new OptimizerError(`Invalid range values at ${path.join(".")}`);
      }
      if (obj.min > obj.max) {
        throw new OptimizerError(
          `Min value greater than max at ${path.join(".")}`,
        );
      }
      if (obj.step <= 0) {
        throw new OptimizerError(`Invalid step value at ${path.join(".")}`);
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        validate(value, [...path, key]);
      }
    }
  }

  try {
    validate(ranges, []);
  } catch (error) {
    if (error instanceof OptimizerError) {
      throw error;
    }
    throw new OptimizerError("Invalid range configuration", error);
  }
}

/**
 * 遗传算法适配器
 */
export async function optimizeWithGeneticAlgorithm(
  options: OptimizeOptions,
): Promise<GeometricConfig> {
  const {
    populationSize = 100,
    generations = 50,
    ranges,
    baseConfig,
    searchRadius = 0.2,
    onProgress,
  } = options;

  try {
    // 验证范围配置
    validateRanges(ranges);

    // 展平范围配置
    let flatRanges = flattenRanges(ranges);

    // 如果有基础配置和搜索半径，调整搜索范围
    if (baseConfig && searchRadius) {
      flatRanges = adjustRangesByRadius(flatRanges, baseConfig, searchRadius);
    }

    // 转换为优化器可用的格式
    const optimizerConfig = convertToOptimizerConfig(flatRanges);
    Object.assign(CONFIG_RANGES, optimizerConfig);

    // 添加进度回调
    const progressCallback = onProgress
      ? (generation: number, bestScore: number) => {
          onProgress({
            phase: "genetic",
            currentStep: generation,
            totalSteps: generations,
            bestScore,
            message: `Generation ${generation}/${generations}, Best Score: ${bestScore.toFixed(2)}`,
          });
        }
      : undefined;

    return findBestConfigGenetic(populationSize, generations, progressCallback);
  } catch (error) {
    throw new OptimizerError("Genetic algorithm optimization failed", error);
  }
}

/**
 * 优化器进度回调
 */
function reportProgress(
  phase: OptimizerProgress["phase"],
  currentStep: number,
  totalSteps: number,
  bestScore: number | undefined,
  message: string,
  onProgress?: (progress: OptimizerProgress) => void,
): void {
  if (onProgress) {
    onProgress({
      phase,
      currentStep,
      totalSteps,
      bestScore,
      message,
    });
  }
}

/**
 * 使用暴力搜索优化几何平衡配置
 */
export async function optimizeWithBruteForce(
  baseConfig: GeometricConfig,
  onProgress?: (progress: OptimizerProgress) => void,
): Promise<GeometricConfig> {
  try {
    const { bestConfig } = bruteForceSearchSingleThread(
      baseConfig,
      (progress) => {
        if (onProgress && typeof progress === "object" && progress.message) {
          reportProgress(
            "bruteforce",
            progress.currentStep || 0,
            progress.totalSteps || 100,
            progress.bestScore,
            progress.message,
            onProgress,
          );
        }
      },
    );

    if (!bestConfig) {
      throw new OptimizerError("暴力搜索未能找到有效配置");
    }

    return bestConfig;
  } catch (error) {
    console.error("暴力搜索优化失败:", error);
    throw new OptimizerError("暴力搜索优化失败", error);
  }
}
