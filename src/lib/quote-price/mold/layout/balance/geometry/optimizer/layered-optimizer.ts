import type { GeometricConfig } from "../types";
import { findBestConfigGenetic } from "./genetic-algorithm";
import { bruteForceSearchSingleThread } from "./brute-force";
import type { UnifiedParamRanges } from "./param-ranges";
import type { OptimizerProgress } from "./types";

/**
 * 分层优化器配置
 */
interface LayeredOptimizerConfig {
  // 基础权重优化配置（使用遗传算法）
  baseWeights: {
    populationSize?: number; // 默认 100
    generations?: number; // 默认 30
  };

  // 详细参数优化配置（使用暴力搜索）
  detailParams: {
    searchRadius: number; // 搜索半径（必需）
    stepScale?: number; // 步长缩放因子（可选，默认 0.1）
  };
}

/**
 * 分层优化器
 * 1. 使用遗传算法优化基础权重
 * 2. 使用暴力搜索优化具体参数
 */
export class LayeredOptimizer {
  constructor(
    private paramRanges: UnifiedParamRanges,
    private config: LayeredOptimizerConfig = {
      baseWeights: {
        populationSize: 100,
        generations: 30,
      },
      detailParams: {
        searchRadius: 0.8,
        stepScale: 0.02,
      },
    },
  ) {
    // 验证配置
    if (
      !config.detailParams.searchRadius ||
      config.detailParams.searchRadius <= 0
    ) {
      throw new Error("searchRadius must be a positive number");
    }
    if (
      config.detailParams.stepScale &&
      (config.detailParams.stepScale <= 0 || config.detailParams.stepScale > 1)
    ) {
      throw new Error("stepScale must be between 0 and 1");
    }
  }

  /**
   * 执行分层优化
   */
  async optimize(
    onProgress?: (progress: OptimizerProgress) => void,
  ): Promise<GeometricConfig> {
    try {
      const { populationSize = 100, generations = 30 } =
        this.config.baseWeights;

      // 1. 使用遗传算法找到基础配置
      const baseConfig = await findBestConfigGenetic(
        populationSize,
        generations,
        (generation: number, bestScore: number) => {
          onProgress?.({
            phase: "genetic",
            currentStep: generation + 1,
            totalSteps: generations,
            bestScore,
            message: `遗传算法优化中...`,
          });
        },
      );

      // 2. 在基础配置附近进行精细搜索
      const { bestConfig } = bruteForceSearchSingleThread(
        baseConfig,
        (progress) => {
          if (onProgress && progress.message) {
            onProgress({
              phase: "bruteforce",
              currentStep: progress.currentStep || 0,
              totalSteps: progress.totalSteps || 100,
              bestScore: progress.bestScore,
              message: progress.message,
            });
          }
        },
      );

      return bestConfig;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("优化过程出错:", errorMessage);
      throw new Error(`优化失败: ${errorMessage}`);
    }
  }
}
