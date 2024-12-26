import {
  runMomentumOptimizer,
  runAspectRatioOptimizer,
  runUniformityOptimizer,
  runDistributionOptimizer,
  runPositionOptimizer,
  runShapeOptimizer,
  runSpaceUtilizationOptimizer,
  runSpacingOptimizer,
  runSymmetryOptimizer,
} from "./optimizer";

import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 优化器返回结果类型
 */
interface OptimizationResult<TInput, TConfig> {
  params: FlatParams;
  config: TConfig;
  scores: ConfigScores<TInput>;
  previousScores: ConfigScores<TInput>;
}

/**
 * 优化器配置
 */
interface OptimizerConfig<TInput = unknown, TConfig = unknown> {
  name: string;
  description: string;
  weight: number;
  run: (iterations: number) => Promise<OptimizationResult<TInput, TConfig>>;
}

/**
 * 优化器注册表
 */
const OPTIMIZERS: OptimizerConfig[] = [
  {
    name: "momentum",
    description: "动量平衡优化器",
    weight: 0.34,
    run: runMomentumOptimizer,
  },
  {
    name: "aspectRatio",
    description: "长宽比优化器",
    weight: 0.35,
    run: runAspectRatioOptimizer,
  },
  {
    name: "uniformity",
    description: "分布均匀性优化器",
    weight: 0.15,
    run: runUniformityOptimizer,
  },
  {
    name: "distance",
    description: "距离分布优化器",
    weight: 0.33,
    run: runDistributionOptimizer,
  },
  {
    name: "position",
    description: "位置分布优化器",
    weight: 0.33,
    run: runPositionOptimizer,
  },
  {
    name: "shapeSimilarity",
    description: "形状相似度优化器",
    weight: 0.15,
    run: runShapeOptimizer,
  },
  {
    name: "spaceUtilization",
    description: "空间利用率优化器",
    weight: 0.3,
    run: runSpaceUtilizationOptimizer,
  },
  {
    name: "spacing",
    description: "间距均匀性优化器",
    weight: 0.2,
    run: runSpacingOptimizer,
  },
  {
    name: "symmetry",
    description: "对称性优化器",
    weight: 0.2,
    run: runSymmetryOptimizer,
  },
];

/**
 * 运行指定的优化器
 */
export async function runOptimizer(
  name: string,
  iterations = 1,
): Promise<void> {
  const optimizer = OPTIMIZERS.find((opt) => opt.name === name);
  if (!optimizer) {
    throw new Error(`未找到优化器: ${name}`);
  }

  console.log(`开始运行${optimizer.description}，权重: ${optimizer.weight}`);
  await optimizer.run(iterations);
}

/**
 * 运行所有优化器
 */
export async function runAllOptimizers(iterations = 1): Promise<void> {
  console.log("开始运行所有优化器...\n");

  for (const optimizer of OPTIMIZERS) {
    console.log(
      `\n[${optimizer.name}] ${optimizer.description} (权重: ${optimizer.weight})`,
    );
    await optimizer.run(iterations);
  }

  console.log("\n所有优化器运行完成！");
}

// 提供一个简单的命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const optimizerName = args[0] ?? "all";
  const iterations = parseInt(args[1] ?? "1", 10);

  if (optimizerName === "all") {
    runAllOptimizers(iterations).catch(console.error);
  } else {
    runOptimizer(optimizerName, iterations).catch(console.error);
  }
}
