import { getRiskScore } from "../risk";
import { runAllScorers, getTopAlignedCuboidsLayout } from "../mold";
import { runEvaluator } from "./utils";
import type { CuboidLayout, BaseCuboid } from "../mold";
import type { Evaluator } from "./utils";
import type { Dimensions } from "../core";

export interface ProductProps {
  id: number;
  materialName: string;
  dimensions: Dimensions;
  quantity: number;
  color: string;
  cavityCount: number;
}

interface EvaluatorResult {
  isPass: boolean;
  scores: Record<string, number>;
}

/**
 * 根据穴数扩展产品立方体
 * @param {ProductProps[]} products 产品列表
 * @returns {BaseCuboid[]} 扩展后的立方体列表
 */
export function expandCuboidsByCavity(products: ProductProps[]): BaseCuboid[] {
  return products.flatMap((product) => {
    const cuboids: BaseCuboid[] = [];
    for (let i = 0; i < product.cavityCount; i++) {
      cuboids.push({
        id: product.id,
        width: product.dimensions.width,
        depth: product.dimensions.depth,
        height: product.dimensions.height,
      });
    }
    return cuboids;
  });
}

/**
 * 创建布局评分评估器
 */
export function createLayoutScorerEvaluator(
  threshold = 40,
): Evaluator<CuboidLayout[]> {
  return {
    name: "layoutScore",
    calculate: (layout) => {
      const scores = runAllScorers(layout, true);
      return scores.weightedAverage;
    },
    threshold, // 阈值
    direction: "greater", // 分数越高越好
  };
}

/**
 * 创建风险评分评估器
 */
export function createRiskScorerEvaluator(threshold = 30): Evaluator<{
  products: ProductProps[];
  layout: CuboidLayout[];
}> {
  return {
    name: "riskScore",
    calculate: ({ products, layout }) => {
      return getRiskScore(products, layout);
    },
    threshold, // 阈值
    direction: "less", // 分数越低越好
  };
}

/**
 * 评估方案是否通过
 * @param {ProductProps[]} products 产品列表
 * @returns {EvaluatorResult} 评估结果
 */
export function evaluateSolution(products: ProductProps[]): EvaluatorResult {
  // 根据穴数扩展产品立方体
  const cuboids = expandCuboidsByCavity(products);

  // 获取布局结果
  const layout = getTopAlignedCuboidsLayout(cuboids);

  // 创建评估器
  const layoutEvaluator = createLayoutScorerEvaluator(60);
  const riskEvaluator = createRiskScorerEvaluator(30);

  // 运行评估器
  const layoutResult = runEvaluator(layout, layoutEvaluator);
  const riskResult = runEvaluator({ products, layout }, riskEvaluator);

  // 收集分数和是否通过的结果
  const scores = {
    layoutScore: layoutResult.score,
    riskScore: riskResult.score,
  };

  const isPass = layoutResult.isPass && riskResult.isPass;

  return {
    isPass,
    scores,
  };
}
