import { describe, test, expect } from "vitest";
import {
  evaluateGroupRisk,
  evaluateGroupCost,
  evaluateGroupFeasibility,
} from "../evaluator";
import { RiskLevel } from "../../../risk/types";
import type { Product } from "../../../product/types";
import type { CavityConfig, GroupingConfig } from "../../types";

// 测试数据准备
const mockProduct1: Product = {
  id: "1",
  name: "Product 1",
  material: {
    name: "Material 1",
    price: 100,
    density: 1,
    shrinkageRate: 1,
    processingTemp: 1,
  },
  dimensions: {
    width: 1,
    depth: 1,
    height: 1,
  },
  color: "red",
  quantity: 1,
  netVolume: 1,
  envelopeVolume: 1,
};

const mockProduct2: Product = {
  id: "2",
  name: "Product 2",
  material: {
    name: "Material 1",
    price: 150,
    density: 1,
    shrinkageRate: 1,
    processingTemp: 1,
  },
  dimensions: {
    width: 1,
    depth: 1,
    height: 1,
  },
  color: "blue",
  quantity: 1,
  netVolume: 1,
  envelopeVolume: 1,
};

const mockCavityConfig: CavityConfig = {
  ratioConstraints: {
    max: 2,
    min: 0.5,
  },
  maxCombinations: 10,
};

const mockGroupingConfig: GroupingConfig = {
  forceGrouping: {
    allowDifferentMaterials: true,
    allowDifferentColors: true,
  },
  risk: {
    weights: {
      materialDifference: 1,
      colorTransition: 1,
      quantityRatio: 1,
      structure: 1,
    },
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
      extreme: 100,
    },
  },
};

describe("evaluateGroupRisk", () => {
  test("should calculate risk for valid products", () => {
    const products = [mockProduct1, mockProduct2];
    const cavities = [2, 4];
    const riskConfig = {
      weights: {
        materialDifference: 1,
        colorTransition: 1,
        quantityRatio: 1,
        structure: 1,
      },
      thresholds: {
        low: 30,
        medium: 60,
        high: 80,
        extreme: 100,
      },
    };

    const result = evaluateGroupRisk(products, cavities, riskConfig);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("level");
  });

  test("should throw error for empty products", () => {
    expect(() =>
      evaluateGroupRisk([], [], { weights: {}, thresholds: {} }),
    ).toThrow("产品列表或穴数列表不能为空");
  });
});

describe("evaluateGroupCost", () => {
  test("should calculate cost correctly for low risk", () => {
    const products = [mockProduct1];
    const cavities = [2];
    const risk = { score: 20, level: RiskLevel.LOW };

    const result = evaluateGroupCost(products, cavities, risk);
    // 基础成本: 100(价格) * 10(体积) * 2(穴数) = 2000
    expect(result).toBe(200);
  });

  test("should apply risk multiplier for medium risk", () => {
    const products = [mockProduct1];
    const cavities = [2];
    const risk = { score: 50, level: RiskLevel.MEDIUM };

    const result = evaluateGroupCost(products, cavities, risk);
    // 基础成本: 2000 * 1.1(中等风险系数)
    expect(result).toBe(220);
  });

  test("should throw error for empty products", () => {
    expect(() =>
      evaluateGroupCost([], [], { score: 0, level: RiskLevel.LOW }),
    ).toThrow("产品列表或穴数列表不能为空");
  });
});

describe("evaluateGroupFeasibility", () => {
  test("should return true for compatible products", () => {
    const products = [mockProduct1, mockProduct2];
    const cavities = [2, 4];

    const result = evaluateGroupFeasibility(
      products,
      cavities,
      mockCavityConfig,
      mockGroupingConfig,
    );
    expect(result).toBe(true);
  });

  test("should return false for invalid cavity ratio", () => {
    const products = [mockProduct1, mockProduct2];
    const cavities = [1, 4];
    const strictCavityConfig: CavityConfig = {
      ratioConstraints: {
        max: 1.5,
        min: 0.8,
      },
      maxCombinations: 10,
    };

    const result = evaluateGroupFeasibility(
      products,
      cavities,
      strictCavityConfig,
      mockGroupingConfig,
    );
    expect(result).toBe(false);
  });

  test("should throw error for mismatched products and cavities", () => {
    expect(() =>
      evaluateGroupFeasibility(
        [mockProduct1],
        [1, 2],
        mockCavityConfig,
        mockGroupingConfig,
      ),
    ).toThrow("产品数量与穴数数量不匹配");
  });
});
