import { describe, it, expect } from "vitest";
import {
  generateSetPartitions,
  filterPartitions,
  bruteForceSearch,
  coordinateDescent,
  searchBestInDimensionDiscrete,
} from "../utils";

describe("generateSetPartitions", () => {
  it("空数组应返回空划分", () => {
    const result = generateSetPartitions([]);
    expect(result).toEqual([[]]);
  });

  it("单个元素应返回单个划分", () => {
    const result = generateSetPartitions(["A"]);
    expect(result).toEqual([[["A"]]]); // 修复：减少一层嵌套
  });

  it("两个元素应生成所有划分", () => {
    const result = generateSetPartitions(["A", "B"]);
    expect(result).toEqual([[["A", "B"]], [["A"], ["B"]]]);
  });

  it("三个元素应生成所有划分", () => {
    const result = generateSetPartitions(["A", "B", "C"]);
    expect(result).toEqual([
      [["A", "B", "C"]],
      [["A", "B"], ["C"]],
      [["A", "C"], ["B"]],
      [["A"], ["B", "C"]],
      [["A"], ["B"], ["C"]],
    ]);
  });

  it("应跳过 undefined 元素", () => {
    const result = generateSetPartitions(["A", undefined, "B"]);
    expect(result).toEqual([[["A", "B"]], [["A"], ["B"]]]);
  });

  it("应正确处理混合类型", () => {
    const result = generateSetPartitions([1, "A", true]);
    expect(result).toEqual([
      [[1, "A", true]],
      [[1, "A"], [true]],
      [[1, true], ["A"]],
      [[1], ["A", true]],
      [[1], ["A"], [true]],
    ]);
  });

  it("应生成正确数量的划分（贝尔数）", () => {
    const items = ["A", "B", "C", "D"];
    const result = generateSetPartitions(items);
    expect(result.length).toBe(15); // B(4) = 15
  });
});

describe("filterPartitions", () => {
  const partitions = [
    [["A", "B", "C"]],
    [["A", "B"], ["C"]],
    [["A", "C"], ["B"]],
    [["A"], ["B", "C"]],
    [["A"], ["B"], ["C"]],
  ];

  it("应根据谓词筛选划分", () => {
    const result = filterPartitions(partitions, (partition) =>
      partition.some((group) => group.join(",") === "A,B"),
    );
    expect(result).toEqual([[["A", "B"], ["C"]]]);
  });

  it("如果没有任何划分匹配，应返回空数组", () => {
    const result = filterPartitions(partitions, (partition) =>
      partition.some((group) => group.join(",") === "X,Y"),
    );
    expect(result).toEqual([]);
  });

  it("如果谓词始终为 true，应返回所有划分", () => {
    const result = filterPartitions(partitions, () => true);
    expect(result).toEqual(partitions);
  });

  it("如果输入划分是空数组，应返回空数组", () => {
    const result = filterPartitions([], () => true);
    expect(result).toEqual([]);
  });
});

describe("Optimization Functions", () => {
  describe("bruteForceSearch", () => {
    it("为简单二次函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(0);
    });

    it("为单维函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const maxValues = [5];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1]);
      expect(result.minVal).toBe(0);
    });

    it("处理未定义的最大值", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [undefined as unknown as number, 2];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(2);
    });
  });

  describe("coordinateDescent", () => {
    it("为凸函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const result = coordinateDescent(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(0);
    });

    it("处理非凸函数", () => {
      const f = (x: number[]) => Math.sin(x[0]!) + Math.cos(x[1]!);
      const maxValues = [5, 5]; // 扩大搜索范围
      const result = coordinateDescent(f, maxValues);
      expect(result.minVal).toBeCloseTo(-2, 0.5); // 调整期望值和精度
    });

    it("处理早期收敛", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [5, 5];
      const result = coordinateDescent(f, maxValues, 1); // Only 1 iteration
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(2);
    });
  });

  describe("searchBestInDimensionDiscrete", () => {
    it("为单维函数找到最佳值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const x = [1];
      const result = searchBestInDimensionDiscrete(x, 0, 5, f);
      expect(result.bestValueInDim).toBe(1);
      expect(result.minVal).toBe(0);
    });

    it("处理零最大值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const x = [1];
      const result = searchBestInDimensionDiscrete(x, 0, 0, f);
      expect(result.bestValueInDim).toBe(1);
      expect(result.minVal).toBe(0);
    });
  });
});
