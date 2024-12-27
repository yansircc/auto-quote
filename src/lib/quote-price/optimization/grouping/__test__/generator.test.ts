import { describe, test, expect } from "vitest";
import { generateAllGroups, generateHeuristicGroups } from "../generator";
import type { Product } from "../../../product/types";
import type { CavityConfig, GroupingConfig } from "../../types";
import { RiskLevel } from "../../../risk/types";

// 测试数据准备
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Product 1",
    material: {
      name: "Material 1",
      density: 1,
      price: 100,
      shrinkageRate: 1,
      processingTemp: 1,
    },
    netVolume: 10,
      dimensions: {
        width: 1,
        depth: 1,
        height: 1,
      },
      color: "blue",
      quantity: 1,
      envelopeVolume: 1,
  },
  {
    id: "2",
    name: "Product 2",
    material: {
      name: "Material 1",
      density: 1,
      price: 100,
      shrinkageRate: 1,
      processingTemp: 1,
    },
    netVolume: 15,
    dimensions: {
      width: 1,
      depth: 1,
      height: 1,
    },
    color: "blue",
    quantity: 1,
    envelopeVolume: 1,
  },
  {
    id: "3",
    name: "Product 3",
    material: {
      name: "Material 2",
      density: 1,
      price: 150,
      shrinkageRate: 1,
      processingTemp: 1,
    },
    netVolume: 20,
    dimensions: {
      width: 1,
      depth: 1,
      height: 1,
    },
    color: "red",
    quantity: 1,
    envelopeVolume: 1,
  },
];

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

const mockCavityConfig: CavityConfig = {
  ratioConstraints: {
    max: 2,
    min: 0.5,
  },
  maxCombinations: 3,
};

describe("generateAllGroups", () => {
  test("should generate groups for single product", () => {
    const result = generateAllGroups(
      [mockProducts[0]!],
      mockGroupingConfig,
      mockCavityConfig
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("products");
    expect(result[0]).toHaveProperty("cavities");
    expect(result[0]).toHaveProperty("riskScore");
    expect(result[0]).toHaveProperty("riskLevel");
  });

  test("should generate groups for multiple compatible products", () => {
    const result = generateAllGroups(
      mockProducts.slice(0, 2), // 使用相同材料但不同颜色的两个产品
      mockGroupingConfig,
      mockCavityConfig
    );

    expect(result.length).toBeGreaterThan(1); // 应该至少包含单个产品的组合和两个产品的组合
    result.forEach(group => {
      expect(group.products.length).toBeGreaterThanOrEqual(1);
      expect(group.cavities.length).toBe(group.products.length);
    });
  });

  test("should throw error for empty products", () => {
    expect(() => generateAllGroups([], mockGroupingConfig, mockCavityConfig))
      .toThrow("产品列表不能为空");
  });

  test("should respect material compatibility settings", () => {
    const strictConfig: GroupingConfig = {
      ...mockGroupingConfig,
      forceGrouping: {
        allowDifferentMaterials: false,
        allowDifferentColors: false,
      },
    };

    const result = generateAllGroups(
      mockProducts,
      strictConfig,
      mockCavityConfig
    );

    // 检查每个组合中的产品是否都使用相同的材料和颜色
    result.forEach(group => {
      if (group.products.length > 1) {
        const firstProduct = group.products[0];
        group.products.forEach(product => {
          expect(product.material.name).toBe(firstProduct?.material.name);
          expect(product.color).toBe(firstProduct?.color);
        });
      }
    });
  });
});

describe("generateHeuristicGroups", () => {
  test("should generate valid groups", () => {
    const result = generateHeuristicGroups(
      mockProducts,
      mockGroupingConfig,
      mockCavityConfig
    );

    expect(result.length).toBeGreaterThan(0);
    result.forEach(group => {
      expect(group.products.length).toBeGreaterThanOrEqual(1);
      expect(group.cavities.length).toBe(group.products.length);
      expect(group.riskLevel).toBeDefined();
      expect(Object.values(RiskLevel)).toContain(group.riskLevel);
    });
  });

  test("should throw error for empty products", () => {
    expect(() => generateHeuristicGroups([], mockGroupingConfig, mockCavityConfig))
      .toThrow("产品列表不能为空");
  });

  test("should respect maxCombinations constraint", () => {
    const config: CavityConfig = {
      ...mockCavityConfig,
      maxCombinations: 2,
    };

    const result = generateHeuristicGroups(
      mockProducts,
      mockGroupingConfig,
      config
    );

    result.forEach(group => {
      expect(group.products.length).toBeLessThanOrEqual(2);
    });
  });

  test("should generate feasible cavity arrangements", () => {
    const result = generateHeuristicGroups(
      mockProducts,
      mockGroupingConfig,
      mockCavityConfig
    );

    result.forEach(group => {
      const maxCavity = Math.max(...group.cavities);
      const minCavity = Math.min(...group.cavities);
      expect(maxCavity / minCavity).toBeLessThanOrEqual(mockCavityConfig.ratioConstraints.max);
    });
  });
});
