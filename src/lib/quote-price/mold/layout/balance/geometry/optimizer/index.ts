import { LayeredOptimizer } from "./layered-optimizer";
import { PARAM_RANGES } from "./optimizer-config";
import { runBalanceTests } from "../__tests__/test-runner";
import { printTestReport } from "../__tests__/test-reporter";

// 导出优化器和工具函数
export { LayeredOptimizer } from "./layered-optimizer";
export { runBalanceTests } from "../__tests__/test-runner";
export { printTestReport } from "../__tests__/test-reporter";
export { PARAM_RANGES } from "./optimizer-config";

// 测试主入口
async function main() {
  // 创建分层优化器
  const optimizer = new LayeredOptimizer(PARAM_RANGES, {
    baseWeights: {
      populationSize: 100,
      generations: 30,
    },
    detailParams: {
      searchRadius: 0.8,
      stepScale: 0.02,
    },
  });

  // 运行优化
  console.log("开始优化...");
  const bestConfig = await optimizer.optimize((progress) => {
    console.log(progress.message);
  });
  console.log("优化完成！");

  // 运行最终测试
  console.log("\n运行测试...");
  const results = runBalanceTests(bestConfig);
  printTestReport(results);

  // 输出最佳配置
  console.log("\n最佳配置：");
  console.log(JSON.stringify(bestConfig, null, 2));
}

// 如果直接运行这个文件，则执行主函数
if (require.main === module) {
  main().catch(console.error);
}
