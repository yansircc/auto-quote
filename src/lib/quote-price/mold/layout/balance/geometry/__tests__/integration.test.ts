import { describe, it, expect } from "vitest";
import { MultiThreadTestRunner } from "./multi-thread-runner";

describe("集成测试", () => {
  it("分层优化器应该能找到满足所有测试用例的配置", async () => {
    const runner = new MultiThreadTestRunner(9); // 使用9个线程
    const { results } = await runner.runMultiThreaded();

    // 验证结果
    const failedTests = results.filter((r) => !r.success);
    if (failedTests.length > 0) {
      console.log("\n失败的测试用例：");
      for (const test of failedTests) {
        console.log(`- ${test.name}:`, {
          分数: test.actualScore.toFixed(2),
          期望最小值: test.expectedMin?.toFixed(2),
          期望最大值: test.expectedMax?.toFixed(2),
          偏差: test.deviation?.toFixed(2),
        });
      }
    }

    // 验证所有测试用例都通过
    expect(failedTests).toHaveLength(0);
  });
});
