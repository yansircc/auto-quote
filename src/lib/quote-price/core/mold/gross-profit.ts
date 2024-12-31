const moldGrossProfitList = [
  { maxWeight: 100, profit: 9000 },
  { maxWeight: 200, profit: 10000 },
  { maxWeight: 300, profit: 11000 },
  { maxWeight: 400, profit: 12000 },
  { maxWeight: 500, profit: 13000 },
  { maxWeight: 600, profit: 14000 },
  { maxWeight: 700, profit: 15000 },
  { maxWeight: 800, profit: 16000 },
  { maxWeight: 900, profit: 17000 },
  { maxWeight: 1000, profit: 18000 },
  { maxWeight: 1100, profit: 20000 },
  { maxWeight: 1200, profit: 20500 },
  { maxWeight: 1300, profit: 21000 },
  { maxWeight: 1400, profit: 21500 },
  { maxWeight: 1500, profit: 22000 },
  { maxWeight: 1600, profit: 22500 },
  { maxWeight: 1700, profit: 23000 },
  { maxWeight: 1800, profit: 23500 },
  { maxWeight: 1900, profit: 24000 },
  { maxWeight: 2000, profit: 24500 },
  { maxWeight: 2100, profit: 25000 },
  { maxWeight: 2200, profit: 25500 },
  { maxWeight: 2300, profit: 26000 },
  { maxWeight: 2400, profit: 26500 },
  { maxWeight: 2500, profit: 27000 },
  { maxWeight: 2600, profit: 27500 },
  { maxWeight: 2700, profit: 28000 },
  { maxWeight: 2800, profit: 28500 },
  { maxWeight: 2900, profit: 29000 },
  { maxWeight: 3000, profit: 29500 },
  { maxWeight: 3100, profit: 30000 },
  { maxWeight: 3200, profit: 30500 },
  { maxWeight: 3300, profit: 31000 },
  { maxWeight: 3400, profit: 31500 },
  { maxWeight: 3500, profit: 32000 },
  { maxWeight: 3600, profit: 32500 },
  { maxWeight: 3700, profit: 33000 },
  { maxWeight: 3800, profit: 33500 },
  { maxWeight: 3900, profit: 34000 },
  { maxWeight: 4000, profit: 34500 },
];

/**
 * 获取模具的利润
 * @param {number} weight 模具重量
 * @returns {number} 模具利润
 */
export function getMoldGrossProfit(weight: number): number {
  if (weight < 0) {
    throw new Error("模具重量不能为负数");
  }

  // 找到第一个满足 weight <= maxWeight 的项
  const profitItem = moldGrossProfitList.find(
    (item) => weight <= item.maxWeight,
  );

  if (!profitItem) {
    // 如果重量超过最大范围，报错
    throw new Error("模具重量超过阈值");
  }

  return profitItem.profit;
}
