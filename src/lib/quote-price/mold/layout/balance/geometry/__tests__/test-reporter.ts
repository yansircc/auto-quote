import type { TestResult } from "./test-runner";

/**
 * 格式化输出测试结果
 * @param results 测试结果
 */
export function printTestReport(results: TestResult[]): void {
  console.log("\n=== 几何平衡测试报告 ===\n");

  let passCount = 0;
  let failCount = 0;
  let criticalFailCount = 0;

  // 先计算通过和失败的数量
  for (const r of results) {
    if (r.success) {
      passCount++;
    } else {
      failCount++;
      if (r.name.toLowerCase().includes("critical")) {
        criticalFailCount++;
      }
    }
  }

  // 按测试结果分组输出
  console.log("通过的测试:");
  for (const r of results) {
    if (r.success) {
      console.log(`  ✅ ${r.name}`);
      console.log(`     得分: ${r.actualScore.toFixed(1)}`);
      if (r.expectedMin !== undefined || r.expectedMax !== undefined) {
        console.log(
          `     期望范围: ${r.expectedMin ?? "-∞"} ~ ${r.expectedMax ?? "+∞"}`,
        );
      }
    }
  }

  if (failCount > 0) {
    console.log("\n失败的测试:");
    for (const r of results) {
      if (!r.success) {
        const isCritical = r.name.toLowerCase().includes("critical");
        console.log(`  ${isCritical ? "❌❌" : "❌"} ${r.name}`);
        console.log(`     得分: ${r.actualScore.toFixed(1)}`);
        console.log(
          `     期望范围: ${r.expectedMin ?? "-∞"} ~ ${r.expectedMax ?? "+∞"}`,
        );
        if (r.deviation) {
          console.log(`     偏差: ${r.deviation.toFixed(1)}`);
        }
      }
    }
  }

  // 输出统计信息
  console.log("\n=== 测试统计 ===");
  console.log(`总测试数: ${results.length}`);
  console.log(`通过: ${passCount}`);
  console.log(`失败: ${failCount} (其中关键测试失败: ${criticalFailCount})`);
  console.log(`通过率: ${((passCount / results.length) * 100).toFixed(1)}%\n`);
}
