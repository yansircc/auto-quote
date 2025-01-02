import { describe, it, expect } from "vitest";
import {
  expandCuboidsByCavity,
  createLayoutScorerEvaluator,
  createRiskScorerEvaluator,
  evaluateSolution,
} from "../evaluator";
import type { ProductProps } from "../evaluator";

// 测试数据
const mockProducts: ProductProps[] = [
  {
    materialName: "wood",
    quantity: 1,
    color: "brown",
    dimensions: { width: 100, depth: 100, height: 100 },
    cavityCount: 2, // 穴数为 2
  },
  {
    materialName: "metal",
    quantity: 1,
    color: "silver",
    dimensions: { width: 50, depth: 50, height: 50 },
    cavityCount: 1, // 穴数为 1
  },
];

describe("expandCuboidsByCavity", () => {
  it("应根据穴数扩展产品立方体", () => {
    const cuboids = expandCuboidsByCavity(mockProducts);
    expect(cuboids.length).toBe(3); // 2 (wood) + 1 (metal) = 3
    expect(cuboids[0]!.width).toBe(100); // 第一个 wood 立方体
    expect(cuboids[2]!.width).toBe(50); // 唯一的 metal 立方体
  });
});

describe("createLayoutScorerEvaluator", () => {
  it("应创建布局评分评估器", () => {
    const evaluator = createLayoutScorerEvaluator();
    expect(evaluator.name).toBe("layoutScore");
    expect(evaluator.threshold).toBe(60);
    expect(evaluator.direction).toBe("greater");
  });
});

describe("createRiskScorerEvaluator", () => {
  it("应创建风险评分评估器", () => {
    const evaluator = createRiskScorerEvaluator();
    expect(evaluator.name).toBe("riskScore");
    expect(evaluator.threshold).toBe(30);
    expect(evaluator.direction).toBe("less");
  });
});

describe("evaluateSolution", () => {
  it("应评估方案并返回结果", () => {
    const result = evaluateSolution(mockProducts);

    // 检查返回结果的结构
    expect(result).toHaveProperty("isPass");
    expect(result).toHaveProperty("scores");
    expect(result.scores).toHaveProperty("layoutScore");
    expect(result.scores).toHaveProperty("riskScore");

    // 检查 isPass 的逻辑
    const isPass =
      result.scores.layoutScore! >= 60 && result.scores.riskScore! <= 30;
    expect(result.isPass).toBe(isPass);
  });
});
