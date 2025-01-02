export interface Evaluator<T> {
  name: string; // 评估器名称
  calculate: (input: T, context?: Record<string, number>) => number; // 打分函数
  threshold: number; // 及格分
  direction: "greater" | "less"; // 评分方向
}

export interface EvaluatorResult {
  isPass: boolean; // 是否通过
  score: number; // 实际得分
}

/**
 * 运行单个评估器
 * @param {T} input 输入数据
 * @param {Evaluator<T>} evaluator 评估器
 * @param {Record<string, number>} context 上下文信息
 * @returns {EvaluatorResult} 评估结果
 */
export function runEvaluator<T>(
  input: T,
  evaluator: Evaluator<T>,
  context: Record<string, number> = {},
): EvaluatorResult {
  const score = evaluator.calculate(input, context);

  const isPass =
    evaluator.direction === "greater"
      ? score >= evaluator.threshold
      : score <= evaluator.threshold;

  return {
    isPass,
    score,
  };
}
