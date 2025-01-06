import { describe, it, expect } from "vitest";
import { runEvaluator } from "../evaluate";
import type { Evaluator } from "../evaluate";

describe("runEvaluator", () => {
  const mockInput = { value: 10 };
  const mockContext = { multiplier: 2 };

  const greaterEvaluator: Evaluator<{ value: number }> = {
    name: "greaterEvaluator",
    calculate: (input, context) => input.value * (context?.multiplier ?? 1),
    threshold: 15,
    direction: "greater",
  };

  const lessEvaluator: Evaluator<{ value: number }> = {
    name: "lessEvaluator",
    calculate: (input, context) => input.value * (context?.multiplier ?? 1),
    threshold: 15,
    direction: "less",
  };
  it("应返回通过的结果（greaterEvaluator）", () => {
    const result = runEvaluator(mockInput, greaterEvaluator, mockContext);
    expect(result.isPass).toBe(true); // 20 >= 15
    expect(result.score).toBe(20);
  });

  it("应返回未通过的结果（greaterEvaluator）", () => {
    const result = runEvaluator({ value: 5 }, greaterEvaluator, mockContext);
    expect(result.isPass).toBe(false); // 10 < 15
    expect(result.score).toBe(10);
  });

  it("应返回通过的结果（lessEvaluator）", () => {
    const result = runEvaluator({ value: 5 }, lessEvaluator, mockContext);
    expect(result.isPass).toBe(true); // 10 <= 15
    expect(result.score).toBe(10);
  });

  it("应返回未通过的结果（lessEvaluator）", () => {
    const result = runEvaluator(mockInput, lessEvaluator, mockContext);
    expect(result.isPass).toBe(false); // 20 > 15
    expect(result.score).toBe(20);
  });
});
