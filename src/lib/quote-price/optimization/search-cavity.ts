/**
 * 函数接收一组产品，生成对应的符合兼容性要求的分组
 * 用getAllMaxCavityCount计算出每个产品的的最大可能的cavityCount（需要考虑到每个产品都至少要有一个穴）
 * 计算所有可能性，比如A的最大cavityCount是3，B的最大cavityCount是2，C的最大cavityCount是1，那么所有可能性就是3*2*1=6种
 * 根据可能性来选择策略，如果小于100种，则使用暴力搜索，否则使用坐标下降，使用的评估函数是价格计算函数，最终返回价格最低的cavityCount
 */

import { bruteForceSearch, coordinateDescent } from "./utils";
import { evaluateSolution } from "./evaluator";
import { calculateSolutionPrice } from "../pipeline";
import { generateGrouping } from "./group-generator";
import { getAllMaxCavityCount } from "./max-cavity";
import type { ForceOptions } from "../core";

interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

export interface ProductProps {
  id: number;
  materialName: string;
  netVolume: number;
  dimensions: Dimensions;
  color: string;
  quantity: number;
}

export interface MoldProps {
  materialName: string;
}

interface Solution {
  cavityCounts: number[];
  price: number;
  layoutScore: number;
  riskScore: number;
}

/**
 * 搜索最佳的cavityCount组合
 * @param {ProductProps[]} products 产品
 * @param {MoldProps} mold 模具
 * @param {ForceOptions} forceOptions 强制选项
 * @returns {Solution[]} 前三名的方案
 */
export function searchBestCavityCount(
  products: ProductProps[],
  mold: MoldProps,
  forceOptions: ForceOptions,
): Solution[] {
  // 创建产品信息映射表
  const productInfoMap = new Map(
    products.map((product) => [product.id, product]),
  );

  // 生成符合兼容性要求的分组
  const grouping = generateGrouping(
    products.map((product) => ({
      id: product.id,
      materialName: product.materialName,
      color: product.color,
    })),
    forceOptions,
  );

  // 对每个分组方案计算最大穴数
  const groupingMaxCavityCounts = grouping.map((partition) => {
    return partition.map((group) => {
      // 从映射表中获取完整产品信息
      const fullProducts = group.map(({ id }) => {
        if (!id) {
          throw new Error("产品 id 不能为空");
        }
        const product = productInfoMap.get(id);
        if (!product) {
          throw new Error(`无法找到 id 为 ${id} 的产品信息`);
        }
        return product;
      });

      // 获取当前分组的最大穴数
      const maxCavityCounts = getAllMaxCavityCount(fullProducts);

      return {
        group: fullProducts,
        maxCavityCounts,
      };
    });
  });

  // 对每个分组方案进行优化
  const optimizedGroupings = groupingMaxCavityCounts.map((partition) =>
    partition.map(({ group, maxCavityCounts }) => {
      // 计算当前分组的所有可能cavityCount组合
      const cavityCountCombinations = group.map((product) => {
        const maxCount = maxCavityCounts[product.id] ?? 1;
        return Array.from({ length: maxCount }, (_, i) => i + 1);
      });

      // 计算组合总数
      const totalCombinations = cavityCountCombinations.reduce(
        (acc, curr) => acc * curr.length,
        1,
      );

      // 选择搜索策略
      const searchStrategy =
        totalCombinations < 100 ? bruteForceSearch : coordinateDescent;

      // 定义评估函数
      const evaluate = (cavityCounts: number[]) => {
        // 为每个产品设置cavityCount
        const updatedProducts = group.map((product, i) => ({
          ...product,
          cavityCount: cavityCounts[i]!,
        }));

        // 计算当前组合的价格
        return calculateSolutionPrice(updatedProducts, mold, forceOptions);
      };

      // 执行搜索
      const result = searchStrategy(
        evaluate,
        cavityCountCombinations.map((arr) => arr.length),
      );

      // 返回当前分组的最佳cavityCount组合
      return {
        cavityCounts: result.minX,
        price: result.minVal,
        products: group,
      };
    }),
  );

  // 将所有分组方案的结果合并并评估
  const evaluatedSolutions = optimizedGroupings.flat().map((solution) => {
    // 更新产品列表的cavityCount
    const updatedProducts = solution.products.map((product, i) => ({
      ...product,
      cavityCount: solution.cavityCounts[i]!,
    }));

    // 评估方案
    const evaluation = evaluateSolution(updatedProducts);

    return {
      cavityCounts: solution.cavityCounts,
      price: solution.price,
      layoutScore: evaluation.scores.layoutScore ?? 0,
      riskScore: evaluation.scores.riskScore ?? 0,
      isPass: evaluation.isPass,
    };
  });

  // 筛选通过评估的方案，并按价格排序
  const validSolutions = evaluatedSolutions
    .filter((solution) => solution.isPass)
    .sort((a, b) => a.price - b.price);

  // 返回前三名的方案
  return validSolutions.slice(0, 3);
}
