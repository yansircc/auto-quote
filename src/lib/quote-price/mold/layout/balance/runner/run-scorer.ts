import type { CuboidLayout } from "../types";
import {
  aspectRatioScorer,
  distanceDistributionScorer,
  distributionUniformityScorer,
  momentumScorer,
  positionDistributionScorer,
  shapeSimilarityScorer,
  spaceUtilizationScorer,
  spacingUniformityScorer,
  symmetryScorer,
} from "../scorer";
import { getTopAlignedCuboidsLayout } from "../scorer/shared";

/**
 * 评分器配置
 */
interface ScorerConfig {
  name: string;
  description: string;
  weight: number;
  run: (layout: CuboidLayout[]) => number;
}

/**
 * 评分器注册表
 */
const SCORERS: ScorerConfig[] = [
  {
    name: "momentum",
    description: "动量平衡评分器",
    weight: 0.34,
    run: momentumScorer,
  },
  {
    name: "aspectRatio",
    description: "长宽比评分器",
    weight: 0.35,
    run: aspectRatioScorer,
  },
  {
    name: "uniformity",
    description: "分布均匀性评分器",
    weight: 0.15,
    run: distributionUniformityScorer,
  },
  {
    name: "distance",
    description: "距离分布评分器",
    weight: 0.33,
    run: distanceDistributionScorer,
  },
  {
    name: "position",
    description: "位置分布评分器",
    weight: 0.33,
    run: positionDistributionScorer,
  },
  {
    name: "shapeSimilarity",
    description: "形状相似度评分器",
    weight: 0.15,
    run: shapeSimilarityScorer,
  },
  {
    name: "spaceUtilization",
    description: "空间利用率评分器",
    weight: 0.3,
    run: spaceUtilizationScorer,
  },
  {
    name: "spacing",
    description: "间距均匀性评分器",
    weight: 0.2,
    run: spacingUniformityScorer,
  },
  {
    name: "symmetry",
    description: "对称性评分器",
    weight: 0.2,
    run: symmetryScorer,
  },
];

/**
 * 运行指定的评分器
 */
export function runScorer(
  name: string,
  layout: CuboidLayout[],
  silence = false,
): number {
  const scorer = SCORERS.find((s) => s.name === name);
  if (!scorer) {
    throw new Error(`未找到评分器: ${name}`);
  }

  if (!silence) {
    console.log(`运行${scorer.description}，权重: ${scorer.weight}`);
  }

  const score = scorer.run(layout);

  if (!silence) {
    console.log(`得分: ${score.toFixed(2)}\n`);
  }

  return score;
}

/**
 * 运行所有评分器
 */
export function runAllScorers(
  layout: CuboidLayout[],
  silence = false,
): {
  [key: string]: number;
  weightedAverage: number;
} {
  if (!silence) {
    console.log("开始运行所有评分器...\n");
  }

  const scores: Record<string, number> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const scorer of SCORERS) {
    if (!silence) {
      console.log(
        `[${scorer.name}] ${scorer.description} (权重: ${scorer.weight})`,
      );
    }

    const score = scorer.run(layout);
    scores[scorer.name] = score;

    // 累加加权分数
    totalWeightedScore += score * scorer.weight;
    totalWeight += scorer.weight;

    if (!silence) {
      console.log(`得分: ${score.toFixed(2)}\n`);
    }
  }

  // 计算加权平均分
  const weightedAverage =
    totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  if (!silence) {
    console.log(`所有评分器运行完成！`);
    console.log(`加权平均分: ${weightedAverage.toFixed(2)}`);
  }

  return {
    ...scores,
    weightedAverage,
  };
}

// 命令行接口也添加 silence 选项
if (require.main === module) {
  const mockCuboids = [
    {
      width: 120,
      depth: 130,
      height: 160,
    },
    {
      width: 120,
      depth: 130,
      height: 200,
    },
    {
      width: 120,
      depth: 130,
      height: 100,
    },
    {
      width: 120,
      depth: 160,
      height: 100,
    },
  ];

  const optimizedCuboidsLayout = getTopAlignedCuboidsLayout(mockCuboids);

  const args = process.argv.slice(2);
  const scorerName = args[0] ?? "all";
  const silence = args.includes("--silence") || args.includes("-s");

  if (scorerName === "all") {
    runAllScorers(optimizedCuboidsLayout, silence);
  } else {
    runScorer(scorerName, optimizedCuboidsLayout, silence);
  }
}

// # 运行所有评分器
// bun run src/lib/quote-price/mold/layout/balance/runner/run-scorer.ts

// # 运行特定评分器
// bun run src/lib/quote-price/mold/layout/balance/runner/run-scorer.ts momentum
