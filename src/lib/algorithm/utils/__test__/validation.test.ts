import { describe, it, expect } from "vitest";
import { isValidGrouping, normalizeGrouping } from "../validation";
import type { Product } from "@/types/domain/product";

describe("validation utils", () => {
  describe("isValidGrouping", () => {
    it("应该验证分组数量至少为2", () => {
      const singleGroup = [[{ weight: 100 }]];
      expect(isValidGrouping(singleGroup).valid).toBe(false);
      expect(isValidGrouping(singleGroup).reason).toBe("分组数量必须至少为2组");
    });

    it("应该验证重量比例限制", () => {
      // 测试小于100克的产品，比例限制为5
      const validRatio = [[{ weight: 20 }, { weight: 30 }], [{ weight: 80 }]];
      expect(isValidGrouping(validRatio).valid).toBe(true);

      const invalidRatio = [[{ weight: 10 }], [{ weight: 60 }]];
      const result = isValidGrouping(invalidRatio);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("重量比例");
    });

    it("应该验证重量差异限制", () => {
      const validDiff = [[{ weight: 200 }], [{ weight: 250 }]];
      expect(isValidGrouping(validDiff).valid).toBe(true);

      const invalidDiff = [[{ weight: 100 }], [{ weight: 300 }]];
      const result = isValidGrouping(invalidDiff);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("重量差异");
    });

    it("应该验证1000克以上的产品", () => {
      const groups = [[{ weight: 1000 }], [{ weight: 500 }]];
      const result = isValidGrouping(groups);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("存在重量超过1000克的产品，需要分开做模具");
    });
  });

  describe("normalizeGrouping", () => {
    it("应该正确标准化分组", () => {
      const groups = [
        [{ weight: 300 }, { weight: 100 }],
        [{ weight: 200 }, { weight: 400 }],
      ];

      const normalized = normalizeGrouping(groups);
      const parsed = JSON.parse(normalized) as Product[][];

      // 确保解析后的数据存在
      if (
        !parsed?.[0]?.[0] ||
        !parsed?.[0]?.[1] ||
        !parsed?.[1]?.[0] ||
        !parsed?.[1]?.[1]
      ) {
        throw new Error("解析后的数据格式不正确");
      }

      // 验证组内排序
      expect(parsed[0][0].weight).toBeLessThan(parsed[0][1].weight);
      expect(parsed[1][0].weight).toBeLessThan(parsed[1][1].weight);

      // 验证组间排序（按总重量）
      const group1Total = parsed[0].reduce((sum, p) => sum + p.weight, 0);
      const group2Total = parsed[1].reduce((sum, p) => sum + p.weight, 0);
      expect(group1Total).toBeLessThanOrEqual(group2Total);
    });

    it("应该对相同的分组产生相同的标准化字符串", () => {
      const groups = [[{ weight: 300 }, { weight: 100 }], [{ weight: 200 }]];
      const groups2 = [[{ weight: 100 }, { weight: 300 }], [{ weight: 200 }]];

      expect(normalizeGrouping(groups)).toBe(normalizeGrouping(groups2));
    });
  });
});
