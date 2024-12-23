import type { GeometricConfig } from "../types";
import type { TestResult } from "./test-runner";

export interface OptimizerConfig {
  baseWeights: {
    populationSize?: number;
    generations?: number;
  };
  detailParams: {
    searchRadius: number;
    stepScale?: number;
  };
}

export interface OptimizationResult {
  config: GeometricConfig;
  results: TestResult[];
  avgScore: number;
  passRate: number;
}

export type WorkerMessage =
  | { type: "progress"; data: string } // 格式: "phase|current|total|score"
  | { type: "result"; data: OptimizationResult }
  | { type: "error"; data: string };
