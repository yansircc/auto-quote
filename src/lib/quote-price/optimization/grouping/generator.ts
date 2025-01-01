<<<<<<< HEAD
import type { Product } from "../../product/types";
=======
import type { DetailedProductProps } from "../../core";
>>>>>>> upstream/main
import {
  generateSetPartitions,
  filterPartitions,
  bruteForceSearch,
  coordinateDescent,
} from "./utils";

/**
 * 临时函数，计算一个产品的成本
 * @param {Product[]} products 产品列表
 * @param {number} cavityCount 穴数
 * @returns {number} 成本
 *
 * 注意：这是一个临时的函数，用于测试，后期需要替换为实际的成本计算函数
 */
<<<<<<< HEAD
function calculateCost(products: Product[], cavityCount: number): number {
  return products.reduce(
    (sum, product) =>
      sum +
      product.material.density *
        product.material.price *
        product.quantity *
        cavityCount,
    0,
  );
=======
function calculateCost(
  products: DetailedProductProps[],
  cavityCount: number,
): number {
  return 1;
>>>>>>> upstream/main
}

/**
 * 临时函数，计算一个产品的最大可能穴数
 * @param {Product} product 产品
 * @returns {number} 最大可能穴数
 *
 * 注意：这是一个临时的函数，用于测试，后期需要替换为实际的穴数计算函数
 */
<<<<<<< HEAD
function calculateMaxCavities(product: Product): number {
  return product.material.density * product.material.price * product.quantity;
}

interface ProductCavityPrice {
  product: Product;
=======
function calculateMaxCavities(product: DetailedProductProps): number {
  return 1;
}

interface ProductCavityPrice {
  product: DetailedProductProps;
>>>>>>> upstream/main
  cavityCount: number;
  cost: number;
}

/**
 * 计算一组产品，在各自不同穴数下的最小成本
 * @param {Product[]} products 产品列表
 * @param {number} judgePoint 判断点，默认 100
 * @param {number} maxIterations 最大迭代次数，默认 50
 * @returns {ProductCavityPrice[]} 产品及其对应的穴数和成本
 */
export function calculateProductCavityPrices(
<<<<<<< HEAD
  products: Product[],
=======
  products: DetailedProductProps[],
>>>>>>> upstream/main
  judgePoint = 100,
  maxIterations = 50,
): ProductCavityPrice[] {
  // 直接计算每个产品的最大穴数
  const maxCavities = products.map((product) => calculateMaxCavities(product));

  // 计算理论上的可能组合的数量
  const maxCombinations = maxCavities.reduce((acc, max) => acc * max, 1);

  // 定义一个临时的成本函数
  const costFunction = (cavities: number[]) => {
    return products.reduce((sum, product, index) => {
      const cavityCount = cavities[index] ?? 1;
      return sum + calculateCost([product], cavityCount);
    }, 0);
  };

  // 根据组合数量选择优化算法
  const { minX: optimalCavities } =
    maxCombinations < judgePoint
      ? bruteForceSearch(costFunction, maxCavities)
      : coordinateDescent(costFunction, maxCavities, maxIterations);

  // 映射结果
  return products.map((product, index) => ({
    product,
    cavityCount: optimalCavities[index] ?? 1,
    cost: calculateCost([product], optimalCavities[index] ?? 1),
  }));
}
