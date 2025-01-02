/**
 * 暴力搜索：返回所有可行解，而不是只返回最优解
 * @param {Function} f 目标函数 (x: number[]) => number
 * @param {number[]} maxValues 每个变量的最大取值
 * @returns {{x: number[], val: number}[]} 所有可能的解和对应的函数值
 *
 * 注意：每个维度的取值范围是 [1..maxValues[i]]，因为0表示不用该变量。
 */
export function bruteForceSearchAll(
  f: (x: number[]) => number,
  maxValues: number[],
): { x: number[]; val: number }[] {
  const results: { x: number[]; val: number }[] = [];

  function dfs(index: number, current: number[]) {
    if (index === maxValues.length) {
      // 递归到叶子，调用目标函数
      try {
        const val = f(current);
        results.push({ x: [...current], val });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn("计算目标函数时发生错误，跳过本轮，继续计算");
      }
      return;
    }

    for (let v = 1; v <= (maxValues[index] ?? 1); v++) {
      current[index] = v;
      dfs(index + 1, current);
    }
  }

  dfs(0, new Array(maxValues.length).fill(1) as number[]);
  return results;
}

/**
 * 坐标下降法搜索多个候选解
 * @param {Function} f 目标函数 (x: number[]) => number
 * @param {number[]} maxValues 每个变量的最大取值
 * @param {number} maxIterations 最大迭代次数，默认50
 * @returns {{
 *   allCandidates: { x: number[], val: number }[];
 *   best: { minX: number[], minVal: number };
 * }}
 *
 * allCandidates：迭代过程中出现的所有解（含起始解和每次改进后的解）
 * best：其中找到的最优解
 */
export function coordinateDescentMulti(
  f: (x: number[]) => number,
  maxValues: number[],
  maxIterations = 50,
): {
  allCandidates: { x: number[]; val: number }[];
  best: { minX: number[]; minVal: number };
} {
  // 用来记录坐标下降过程出现过的所有解
  const allCandidates: { x: number[]; val: number }[] = [];

  // 全局最优解
  let bestResult = { minX: maxValues.map(() => 1), minVal: Infinity };

  // 简单起始点：全1；若想更多起始点可自行添加
  const startingPoints = [maxValues.map(() => 1)];

  for (const start of startingPoints) {
    const currentX = [...start];
    let currentVal = f(currentX);

    // 记录起始解
    allCandidates.push({ x: [...currentX], val: currentVal });

    for (let iter = 0; iter < maxIterations; iter++) {
      let improved = false;

      for (let d = 0; d < maxValues.length; d++) {
        const maxVal = maxValues[d] ?? 1;
        const { bestValueInDim, minVal } = searchBestInDimensionDiscrete(
          currentX,
          d,
          maxVal,
          f,
        );
        if (minVal < currentVal) {
          currentX[d] = bestValueInDim;
          currentVal = minVal;
          improved = true;

          // 记录改进后的解
          allCandidates.push({ x: [...currentX], val: currentVal });
        }
      }

      if (!improved) {
        // 若本轮没有任何改进，提前停止
        break;
      }
    }

    // 更新全局最优解
    if (currentVal < bestResult.minVal) {
      bestResult = { minX: [...currentX], minVal: currentVal };
    }
  }

  return {
    allCandidates,
    best: bestResult,
  };
}

/**
 * 在固定除第 d 维外其它值后，对第 d 维做离散搜索 (1 ~ maxVal)
 * 返回找到的最佳取值(整数) 以及对应函数值
 */
export function searchBestInDimensionDiscrete(
  x: number[],
  d: number,
  maxVal: number,
  f: (x: number[]) => number,
): { bestValueInDim: number; minVal: number } {
  const originalD = x[d] ?? 1;
  let bestValueInDim = originalD;
  let minVal = f(x);

  for (let v = 1; v <= maxVal; v++) {
    x[d] = v;
    try {
      const val = f(x);
      if (val < minVal) {
        minVal = val;
        bestValueInDim = v;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn("计算目标函数时发生错误，跳过本轮，继续计算");
    }
  }

  // 恢复 x[d] 为找到的最佳取值
  x[d] = bestValueInDim;
  return { bestValueInDim, minVal };
}
