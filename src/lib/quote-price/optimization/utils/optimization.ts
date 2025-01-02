/**
 * 暴力搜索最优解
 * @param {Function} f 目标函数
 * @param {number[]} maxValues 每个变量的最大取值
 * @returns {{minX: number[], minVal: number}} 最优解和对应的函数值
 *
 * 注意：每个变量的取值范围从 1 开始，因为 0 表示不取该变量
 */
export function bruteForceSearch(
  f: (x: number[]) => number,
  maxValues: number[],
): { minX: number[]; minVal: number } {
  let minVal = Infinity;
  let minX: number[] = [];

  function dfs(index: number, current: number[]) {
    if (index === maxValues.length) {
      const val = f(current);
      if (val < minVal) {
        minVal = val;
        minX = [...current];
      }
      return;
    }

    for (let v = 1; v <= (maxValues[index] ?? 1); v++) {
      current[index] = v;
      dfs(index + 1, current);
    }
  }

  dfs(0, new Array(maxValues.length).fill(1) as number[]);
  return { minX, minVal };
}

/**
 * 坐标下降法搜索最优解
 * @param {Function} f 目标函数
 * @param {number[]} maxValues 每个变量的最大取值
 * @param {number} maxIterations 最大迭代次数，默认50
 * @returns {{minX: number[], minVal: number}} 最优解和对应的函数值
 */
export function coordinateDescent(
  f: (x: number[]) => number,
  maxValues: number[],
  maxIterations = 50,
): { minX: number[]; minVal: number } {
  let bestResult = { minX: maxValues.map(() => 1), minVal: Infinity };

  const startingPoints = [maxValues.map(() => 1)];

  for (const start of startingPoints) {
    const currentX = [...start];
    let currentVal = f(currentX);

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
        }
      }

      if (!improved) {
        break;
      }
    }

    if (currentVal < bestResult.minVal) {
      bestResult = { minX: currentX, minVal: currentVal };
    }
  }

  return bestResult;
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
  // Ensure x[d] exists with a default value of 1
  const originalD = x[d] ?? 1;
  let bestValueInDim = originalD;
  let minVal = f(x);

  for (let v = 1; v <= maxVal; v++) {
    x[d] = v;
    const val = f(x);
    if (val < minVal) {
      minVal = val;
      bestValueInDim = v;
    }
  }

  // Restore to the found optimal value
  x[d] = bestValueInDim;
  return { bestValueInDim, minVal };
}
