/**
 * 当前文档包含了一系列工具函数，包括：
 * 1. 生成所有可能的集合划分
 * 2. 筛选分组方案
 * 3. 暴力搜索最优解
 * 4. 坐标下降法搜索最优解
 */

/**
 * 生成所有可能的集合划分
 * @param {T[]} items 项目列表
 * @returns {T[][][]} 所有可能的集合划分
 */
export function generateSetPartitions<T>(items: T[]): T[][][] {
  if (items.length === 0) return [[]];

  // 确保第一个元素存在
  const firstItem = items[0];
  if (firstItem === undefined) return [[]];

  // 使用迭代代替递归
  const partitions: T[][][] = [[[firstItem]]];

  for (let i = 1; i < items.length; i++) {
    const currentItem = items[i];
    if (currentItem === undefined) continue; // 跳过 undefined 元素

    const newPartitions: T[][][] = [];

    for (const partition of partitions) {
      // 将当前元素添加到每个现有子集
      for (let j = 0; j < partition.length; j++) {
        const newPartition = partition.map((subset, index) =>
          index === j ? [...subset, currentItem] : subset,
        );
        newPartitions.push(newPartition);
      }

      // 创建新的子集
      newPartitions.push([...partition, [currentItem]]);
    }

    partitions.length = 0; // 清空原数组
    partitions.push(...newPartitions); // 更新为新划分
  }

  return partitions;
}

/**
 * 筛选分组方案
 * @param {T[][][]} partitions 所有可能的分组方案
 * @param {(partition: T[][]) => boolean} predicate 筛选条件回调函数
 * @returns {T[][][]} 满足条件的分组方案
 */
export function filterPartitions<T>(
  partitions: T[][][],
  predicate: (partition: T[][]) => boolean,
): T[][][] {
  return partitions.filter(predicate);
}

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
 * @param {number} maxIterations 最大迭代次数
 * @returns {{minX: number[], minVal: number}} 最优解和对应的函数值
 */
export function coordinateDescent(
  f: (x: number[]) => number,
  maxValues: number[],
  maxIterations = 50,
  initialPoints: number[][] = [],
): { minX: number[]; minVal: number } {
  let bestResult = { minX: maxValues.map(() => 1), minVal: Infinity };

  const startingPoints =
    initialPoints.length > 0 ? initialPoints : [maxValues.map(() => 1)];

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
