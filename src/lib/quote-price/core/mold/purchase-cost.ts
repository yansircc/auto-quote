interface PurchaseCostRule {
  weightRange: [number, number];
  coefficient: number;
}

const purchaseCostList: PurchaseCostRule[] = [
  {
    weightRange: [0, 1000],
    coefficient: 4,
  },
  {
    weightRange: [1000, 4000],
    coefficient: 3,
  },
];

/**
 * 获取采购成本的计算倍率
 * @param {number} weight 模具重量
 * @returns {number} 采购成本的计算倍率
 */
export function getPurchaseCostMultiple(weight: number): number {
  if (weight < 0) {
    throw new Error("模具重量不能为负数");
  }

  const costItem = purchaseCostList.find((rule) =>
    isWeightInRange(weight, rule.weightRange),
  );

  if (!costItem) {
    throw new Error(`模具重量 ${weight} 超出计算范围`);
  }

  return costItem.coefficient;
}

/**
 * 检查重量是否在指定范围内
 * @param {number} weight 模具重量
 * @param {[number, number]} range 重量范围
 * @returns {boolean} 是否在范围内
 */
function isWeightInRange(weight: number, range: [number, number]): boolean {
  const [minWeight, maxWeight] = range;
  return weight >= minWeight && weight < maxWeight;
}
