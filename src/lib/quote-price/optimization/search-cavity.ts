import { bruteForceSearchAll, coordinateDescentMulti } from "./utils";
import { evaluateSolution } from "./evaluator";
import { calculateSolutionPrice } from "./solution-price";
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

/** "产品ID -> cavityCount" 的映射 */
interface ProductCavityMap {
  productId: number;
  cavityCount: number;
}

/** 单个模具的方案信息 */
interface MoldSolution {
  productCavityMap: ProductCavityMap[];
  price: number;
  layoutScore: number;
  riskScore: number;
  isPass: boolean;
}

/** 最终返回的完整方案信息（可能包含多个模具） */
export interface CompleteSolution {
  total: number;
  breakdown: MoldSolution[];
}

// ========= 可以在这里配置截断大小 =========
const TOP_K_PER_SUBGROUP = 5; // 每个子组最多保留多少解
const TOP_K_PER_PARTITION = 5; // 每个分组合并后最多保留多少解
const TOP_K_GLOBAL = 5; // 多分组合并后最多保留多少全局解

/**
 * 计算单个模具的解决方案
 */
function calculateMoldSolution(
  products: (ProductProps & { cavityCount: number })[],
  mold: MoldProps,
  forceOptions: ForceOptions,
): MoldSolution {
  const { total: price } = calculateSolutionPrice(products, mold, forceOptions);
  const evalResult = evaluateSolution(products);

  return {
    productCavityMap: products.map((p) => ({
      productId: p.id,
      cavityCount: p.cavityCount,
    })),
    price,
    layoutScore: evalResult.scores.layoutScore ?? 0,
    riskScore: evalResult.scores.riskScore ?? 0,
    isPass: evalResult.isPass,
  };
}

/**
 * 搜索最佳的cavityCount组合（返回所有产品的方案）
 */
export function searchBestCavityCount(
  products: ProductProps[],
  molds: MoldProps[],
  forceOptions: ForceOptions,
): CompleteSolution[] {
  // 添加对空产品列表的校验
  if (products.length === 0) {
    throw new Error("产品列表不能为空");
  }

  if (products.length > 7) {
    throw new Error("产品数量不能超过7");
  }

  // 1) 生成满足兼容性要求的分组
  const grouping = generateGrouping(
    products.map((p) => ({
      id: p.id,
      materialName: p.materialName,
      color: p.color,
    })),
    forceOptions,
  );

  // 创建一个 Map 快速拿到产品信息
  const productInfoMap = new Map(
    products.map((p) => {
      if (p.id == null || typeof p.id !== "number") {
        throw new Error("无效的产品ID");
      }
      return [p.id, p];
    }),
  );

  // 2) 对 grouping 做处理：对每个 partition 的每个子组，都搜到一堆解，但立刻做"排序+截断"
  const partitionCandidates: CompleteSolution[][] = [];

  grouping.forEach((partition, partitionIndex) => {
    const subGroupCandidatesList: CompleteSolution[][] = [];

    partition.forEach((subGroup) => {
      const fullProducts = subGroup.map(({ id }) => {
        const p = productInfoMap.get(id!);
        if (!p) {
          throw new Error(`无法找到产品 id=${id}`);
        }
        return p;
      });

      // 计算 maxCavity
      const maxCavityMap = getAllMaxCavityCount(fullProducts);
      const cavityRanges = fullProducts.map((p) => {
        const maxCav = Math.min(
          maxCavityMap[p.id] ?? 1,
          getDynamicMaxCavityCount(fullProducts.length),
        );
        return Array.from({ length: maxCav }, (_, i) => i + 1);
      });

      // 目标函数
      const fn = (cavityCounts: number[]) => {
        const updatedProducts = fullProducts.map((prod, i) => ({
          ...prod,
          cavityCount: cavityCounts[i] ?? 1,
        }));
        const moldSolution = calculateMoldSolution(
          updatedProducts,
          molds[0]!,
          forceOptions,
        );
        return moldSolution.price;
      };

      const totalComb = cavityRanges.reduce((acc, arr) => acc * arr.length, 1);

      let subGroupCandidates: CompleteSolution[] = [];

      if (totalComb < 1000) {
        // 用暴力搜索
        const bfsResults = bruteForceSearchAll(
          fn,
          cavityRanges.map((arr) => arr.length),
        );
        subGroupCandidates = bfsResults.map(({ x }) => {
          const updatedProducts = fullProducts.map((prod, i) => ({
            ...prod,
            cavityCount: x[i] ?? 1,
          }));
          const moldSolution = calculateMoldSolution(
            updatedProducts,
            molds[0]!,
            forceOptions,
          );
          return {
            total: moldSolution.price,
            breakdown: [moldSolution],
          };
        });
      } else {
        // 坐标下降
        const { allCandidates } = coordinateDescentMulti(
          fn,
          cavityRanges.map((arr) => arr.length),
        );
        subGroupCandidates = allCandidates.map((c) => {
          const updatedProducts = fullProducts.map((prod, i) => ({
            ...prod,
            cavityCount: c.x[i] ?? 1,
          }));
          const moldSolution = calculateMoldSolution(
            updatedProducts,
            molds[0]!,
            forceOptions,
          );
          return {
            total: moldSolution.price,
            breakdown: [moldSolution],
          };
        });
      }

      // 按总价格排序，只保留前 TOP_K_PER_SUBGROUP 条
      subGroupCandidates.sort((a, b) => a.total - b.total);
      subGroupCandidates = subGroupCandidates.slice(0, TOP_K_PER_SUBGROUP);

      // 收集
      subGroupCandidatesList.push(subGroupCandidates);
    });

    // 对每个partition做"逐步合并+截断"
    let partitionSolutions: CompleteSolution[] = [{ total: 0, breakdown: [] }];

    for (const subGroupSolutions of subGroupCandidatesList) {
      partitionSolutions = mergeTwoGroupsWithPrune(
        partitionSolutions,
        subGroupSolutions,
        TOP_K_PER_PARTITION,
      );
    }

    partitionCandidates[partitionIndex] = partitionSolutions;
  });

  // 3) 合并所有partition的解
  let globalSolutions = [{ total: 0, breakdown: [] as MoldSolution[] }];
  for (const partSols of partitionCandidates) {
    globalSolutions = mergeTwoGroupsWithPrune(
      globalSolutions,
      partSols,
      TOP_K_GLOBAL,
    );
  }

  // 4) 筛选并排序
  const valid = globalSolutions
    .filter((sol) => sol.breakdown.every((mold) => mold.isPass))
    .sort((a, b) => a.total - b.total);

  const best = valid.slice(0, 3);
  console.log("best", best);
  return best;
}

/**
 * 将两个候选解列表 A, B 做笛卡尔乘积，并将结果按总价格排序后截断到前 k 条
 */
function mergeTwoGroupsWithPrune(
  A: CompleteSolution[],
  B: CompleteSolution[],
  k: number,
): CompleteSolution[] {
  const merged: CompleteSolution[] = [];

  for (const a of A) {
    for (const b of B) {
      // 合并两个解的breakdown和总价
      merged.push({
        total: a.total + b.total,
        breakdown: [...a.breakdown, ...b.breakdown],
      });
    }
  }

  // 按总价格排序
  merged.sort((x, y) => x.total - y.total);

  // 只保留前 k 条
  return merged.slice(0, k);
}

/**
 * 根据产品数量动态计算最大穴数
 * @param productCount 产品数量
 * @returns 最大穴数
 */
function getDynamicMaxCavityCount(productCount: number): number {
  const minCount = 10;
  const maxCount = 50;
  const minProductCount = 7;
  const maxProductCount = 1;

  const slope = (minCount - maxCount) / (minProductCount - maxProductCount);
  const intercept = maxCount - slope * maxProductCount;
  const dynamicValue = slope * productCount + intercept;

  return Math.max(minCount, Math.min(maxCount, Math.floor(dynamicValue)));
}
