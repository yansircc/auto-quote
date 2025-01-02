import { describe, it, expect } from "vitest";
import { generateSetPartitions, filterPartitions } from "../set-partitions";

describe("generateSetPartitions", () => {
  it("空数组应返回空划分", () => {
    const result = generateSetPartitions([]);
    expect(result).toEqual([[]]);
  });

  it("单个元素应返回单个划分", () => {
    const result = generateSetPartitions(["A"]);
    expect(result).toEqual([[["A"]]]);
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
