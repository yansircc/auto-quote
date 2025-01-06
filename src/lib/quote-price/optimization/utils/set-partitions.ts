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
