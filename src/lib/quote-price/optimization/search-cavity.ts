// searchBestCavityCount.ts

import { bruteForceSearchAll, coordinateDescentMulti } from "./utils";
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

/** “产品ID -> cavityCount” 的映射 */
interface ProductCavityMap {
  productId: number;
  cavityCount: number;
}

/** 最终返回的完整方案信息 */
interface Solution {
  productCavityMap: ProductCavityMap[];
  price: number;
  layoutScore: number;
  riskScore: number;
  isPass: boolean;
}

// ========= 可以在这里配置截断大小 =========
const TOP_K_PER_SUBGROUP = 5; // 每个子组最多保留多少解
const TOP_K_PER_PARTITION = 5; // 每个分组合并后最多保留多少解
const TOP_K_GLOBAL = 5; // 多分组合并后最多保留多少全局解

/**
 * 搜索最佳的cavityCount组合（返回所有产品的方案）
 */
export function searchBestCavityCount(
  products: ProductProps[],
  mold: MoldProps,
  forceOptions: ForceOptions,
): Solution[] {
  console.log("开始搜索最佳穴数组合，产品数量:", products.length);

  // 添加对空产品列表的校验
  if (products.length === 0) {
    throw new Error("产品列表不能为空");
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
      // 校验产品ID是否有效
      if (p.id == null || typeof p.id !== "number") {
        throw new Error("无效的产品ID");
      }
      return [p.id, p];
    }),
  );

  // 2) 对 grouping 做处理：对每个 partition 的每个子组，都搜到一堆解，但立刻做“排序+截断”
  const partitionCandidates: {
    productCavityMap: ProductCavityMap[];
    price: number;
  }[][] = [];
  // ↑ partitionCandidates[i] 是 partition i 的候选解数组；
  //   里面每个元素包含 { productCavityMap, price }

  grouping.forEach((partition, partitionIndex) => {
    // 先对 partition 中的每个“子组”做搜索，再“逐步合并+截断”
    // subGroupCandidatesList: T[][]，其中每个 T[] 是某子组的一批解
    const subGroupCandidatesList: {
      productCavityMap: ProductCavityMap[];
      price: number;
    }[][] = [];

    partition.forEach((subGroup) => {
      // 从 productInfoMap 拿到所有产品对象
      const fullProducts = subGroup.map(({ id }) => {
        const p = productInfoMap.get(id!);
        if (!p) {
          throw new Error(`无法找到产品 id=${id}`);
        }
        return p;
      });

      // 计算 maxCavity
      const maxCavityMap = getAllMaxCavityCount(fullProducts);
      // 转成 [ [1..maxCavity], ... ]
      const cavityRanges = fullProducts.map((p) => {
        const maxCav = maxCavityMap[p.id] ?? 1;
        return Array.from({ length: maxCav }, (_, i) => i + 1);
      });

      // 目标函数
      const fn = (cavityCounts: number[]) => {
        const updated = fullProducts.map((prod, i) => ({
          ...prod,
          cavityCount: cavityCounts[i] ?? 1,
        }));
        return calculateSolutionPrice(updated, mold, forceOptions);
      };

      // 算出组合总数
      const totalComb = cavityRanges.reduce((acc, arr) => acc * arr.length, 1);

      let subGroupCandidates: {
        productCavityMap: ProductCavityMap[];
        price: number;
      }[] = [];

      if (totalComb < 1000) {
        // 用暴力搜索
        const bfsResults = bruteForceSearchAll(
          fn,
          cavityRanges.map((arr) => arr.length),
        );
        subGroupCandidates = bfsResults.map(({ x, val }) => ({
          productCavityMap: x.map((cnt, i) => ({
            productId: fullProducts[i]!.id,
            cavityCount: cnt,
          })),
          price: val,
        }));
      } else {
        // 坐标下降
        const { allCandidates } = coordinateDescentMulti(
          fn,
          cavityRanges.map((arr) => arr.length),
        );
        subGroupCandidates = allCandidates.map((c) => ({
          productCavityMap: c.x.map((cnt, i) => ({
            productId: fullProducts[i]!.id,
            cavityCount: cnt,
          })),
          price: c.val,
        }));
      }

      // 先按价格排升序，只保留前 TOP_K_PER_SUBGROUP 条
      subGroupCandidates.sort((a, b) => a.price - b.price);
      subGroupCandidates = subGroupCandidates.slice(0, TOP_K_PER_SUBGROUP);

      // 收集
      subGroupCandidatesList.push(subGroupCandidates);
    });

    // subGroupCandidatesList 是 partition 里每个子组的一批解
    // 我们做“逐步合并+截断”，得到 partition 级候选解
    let partitionSolutions: {
      productCavityMap: ProductCavityMap[];
      price: number;
    }[] = [{ productCavityMap: [], price: 0 }];

    for (const subGroupSolutions of subGroupCandidatesList) {
      partitionSolutions = mergeTwoGroupsWithPrune(
        partitionSolutions,
        subGroupSolutions,
        TOP_K_PER_PARTITION,
      );
    }

    // 得到 partition 级别的解(含该 partition 所有子组)，保存
    partitionCandidates[partitionIndex] = partitionSolutions;
  });

  // 3) 如果 grouping 只有一个 partition，就直接用 partitionCandidates[0];
  //    否则再做“逐步合并+截断”
  let globalSolutions = [
    { productCavityMap: [] as ProductCavityMap[], price: 0 },
  ];
  for (const partSols of partitionCandidates) {
    globalSolutions = mergeTwoGroupsWithPrune(
      globalSolutions,
      partSols,
      TOP_K_GLOBAL,
    );
  }

  console.log("最终组合数量:", globalSolutions.length);

  // 4) 最后对 globalSolutions 中每个方案做 evaluateSolution
  const evaluated: Solution[] = globalSolutions.map((sol) => {
    // 构造 updatedProducts
    const updatedProducts = sol.productCavityMap.map((pm) => {
      const originalP = productInfoMap.get(pm.productId)!;
      return {
        ...originalP,
        cavityCount: pm.cavityCount,
      };
    });

    // 做评估
    const evalResult = evaluateSolution(updatedProducts);

    return {
      productCavityMap: sol.productCavityMap.sort(
        (a, b) => a.productId - b.productId,
      ),
      price: sol.price,
      layoutScore: evalResult.scores.layoutScore ?? 0,
      riskScore: evalResult.scores.riskScore ?? 0,
      isPass: evalResult.isPass,
    };
  });

  // 5) 筛选并排序
  const valid = evaluated
    .filter((v) => v.isPass)
    .sort((a, b) => a.price - b.price);

  const top3 = valid.slice(0, 3);
  // console.log("top3", top3);
  return top3;
}

/**
 * 将两个候选解列表 A, B 做笛卡尔乘积，并将结果按 price 排序后截断到前 k 条
 * 每条解合并时，price = A.price + B.price，productCavityMap = A+B
 */
function mergeTwoGroupsWithPrune(
  A: { productCavityMap: ProductCavityMap[]; price: number }[],
  B: { productCavityMap: ProductCavityMap[]; price: number }[],
  k: number,
): { productCavityMap: ProductCavityMap[]; price: number }[] {
  const merged: { productCavityMap: ProductCavityMap[]; price: number }[] = [];
  for (const a of A) {
    for (const b of B) {
      const combinedPrice = a.price + b.price;

      // 创建一个 Map 来去重，以 productId 为 key
      const combinedMap = new Map<number, ProductCavityMap>();

      // 添加 A 组的 productCavityMap
      a.productCavityMap.forEach((item) => {
        combinedMap.set(item.productId, item);
      });

      // 添加 B 组的 productCavityMap，如果有重复会覆盖
      b.productCavityMap.forEach((item) => {
        combinedMap.set(item.productId, item);
      });

      // 将 Map 转换回数组
      merged.push({
        productCavityMap: Array.from(combinedMap.values()),
        price: combinedPrice,
      });
    }
  }

  // 按 price 排序
  merged.sort((x, y) => x.price - y.price);

  // 只保留前 k 条
  return merged.slice(0, k);
}
