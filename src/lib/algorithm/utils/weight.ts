interface Product {
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

/**
 * 获取允许的重量差异
 */
export function getWeightDiff(products: Product[]): number {
  const maxWeight = Math.max(...products.map((p) => p.weight));
  if (maxWeight < 100) return 50;
  if (maxWeight < 200) return 100;
  if (maxWeight < 300) return 100;
  if (maxWeight < 400) return 100;
  if (maxWeight < 500) return 150;
  if (maxWeight < 600) return 150;
  if (maxWeight < 700) return 150;
  if (maxWeight < 800) return 200;
  if (maxWeight < 900) return 200;
  if (maxWeight < 1000) return 200;
  return 0; // >=1000克时需要分开做模具
}

/**
 * 获取允许的最大重量比例
 */
export function getMaxWeightRatio(products: Product[]): number {
  const maxWeight = Math.max(...products.map((p) => p.weight));

  // 所有产品都小于100克时，比例为5
  if (products.every((p) => p.weight < 100)) return 5;

  // 根据最大重量判断
  if (maxWeight < 400) return 2.5; // 100-400克
  if (maxWeight < 700) return 2; // 400-700克
  if (maxWeight < 1000) return 1.5; // 700-1000克
  return 1; // >=1000克时需要分开做模具
}

/**
 * 计算一组产品的总重量
 */
export function getGroupWeight(group: Product[]): number {
  return group.reduce((sum, p) => sum + p.weight, 0);
}
