import type { TestCase, TestCases } from "../types/core";

/**
 * 测试用例构建器选项
 */
export interface TestCaseBuilderOptions<TInput> {
  // 输入参数
  input: TInput;
  // 期望分数范围
  minScore?: number;
  maxScore?: number;
  // 或精确分数
  exactScore?: number;
  // 描述
  description: string;
}

/**
 * 创建测试用例
 */
export function createTestCase<TInput, TConfig>({
  input,
  minScore,
  maxScore,
  exactScore,
  description,
}: TestCaseBuilderOptions<TInput>): TestCase<TInput, TConfig> {
  return {
    input,
    expect:
      exactScore !== undefined
        ? { exact: exactScore }
        : { min: minScore ?? 0, max: maxScore ?? 100 },
    description,
  };
}

/**
 * 创建测试用例集
 */
export function createTestCases<TInput, TConfig>(
  cases: TestCaseBuilderOptions<TInput>[],
): TestCases<TInput, TConfig> {
  return {
    cases: cases.map((options) => createTestCase<TInput, TConfig>(options)),
  };
}
