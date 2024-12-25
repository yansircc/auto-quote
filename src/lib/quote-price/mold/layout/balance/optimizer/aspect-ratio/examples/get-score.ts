import { getScore } from "../optimizer";
import { BEST_PARAMS } from "../scoring/best-params";
/*
  longestToShortest: 这是最长边与最短边的比例，表示物体的长宽比。
  middleToShortest: 这是中间长度边与最短边的比例，表示物体的中间边与最短边的比例。
  longestToMiddle: 这是最长边与中间长度边的比例，表示物体的最长边与中间边的比例。
*/
const input = {
  longestToShortest: 1.2727616677293079,
  middleToShortest: 1.0634950599248065,
  longestToMiddle: 1.060741569951675,
};
const result = getScore(input, BEST_PARAMS);
console.log(result.toFixed(2));
// bun run src/lib/quote-price/mold/layout/balance/optimizer/aspect-ratio/examples/get-score.ts
