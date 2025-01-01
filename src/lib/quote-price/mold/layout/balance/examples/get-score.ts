import { runAllScorers } from "../runner";
import { getTopAlignedCuboidsLayout } from "../scorer/shared";
import type { BaseCuboid } from "../types";

const mockCuboids: BaseCuboid[] = [
  {
    width: 120,
    depth: 130,
    height: 160,
  },
  {
    width: 120,
    depth: 130,
    height: 200,
  },
  {
    width: 120,
    depth: 130,
    height: 100,
  },
  {
    width: 120,
    depth: 160,
    height: 100,
  },
];

const optimizedCuboidsLayout = getTopAlignedCuboidsLayout(mockCuboids);

const { weightedAverage, ...scores } = runAllScorers(
  optimizedCuboidsLayout,
  true,
); // 第二个参数表示静默模式

// 输出加权平均分
console.log("加权平均分:", weightedAverage);

// 输出所有评分器的分数
console.log("所有评分器的分数:", scores);
// bun run src/lib/quote-price/mold/layout/balance/examples/get-score.ts
