import { calculateGeometricBalance } from "../geometric-balance";
import { TEST_CASES } from "./test-cases";
import type { GeometricConfig } from "../types";

/**
 * 代表单次测试的结果
 */
export interface TestResult {
  name: string;
  actualScore: number;
  expectedMin?: number;
  expectedMax?: number;
  success: boolean;
  deviation?: number; // 超出期望范围的偏差
}

/**
 * 运行一组测试用例
 * @param config 要测试的 GeometricConfig
 * @returns 返回所有测试结果
 */
export function runBalanceTests(config: GeometricConfig): TestResult[] {
  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    const score = calculateGeometricBalance(testCase.cuboids, config);
    let success = true;
    let dev = 0;

    if (testCase.expectedMin !== undefined && score < testCase.expectedMin) {
      success = false;
      dev = testCase.expectedMin - score;
    }
    if (testCase.expectedMax !== undefined && score > testCase.expectedMax) {
      success = false;
      dev = score - (testCase.expectedMax ?? 0);
    }

    results.push({
      name: testCase.name,
      actualScore: score,
      expectedMin: testCase.expectedMin,
      expectedMax: testCase.expectedMax,
      success,
      deviation: dev,
    });
  }

  return results;
}
