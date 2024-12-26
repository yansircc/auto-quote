import { getScore } from "../aspect-ratio/optimizer";
import { BEST_PARAMS } from "../aspect-ratio/scoring/best-params";
/*
  longestToShortest: 这是最长边与最短边的比例，表示物体的长宽比。
  middleToShortest: 这是中间长度边与最短边的比例，表示物体的中间边与最短边的比例。
  longestToMiddle: 这是最长边与中间长度边的比例，表示物体的最长边与中间边的比例。
*/
const input = {
  longestToShortest: 2.6,
  middleToShortest: 2.4,
  longestToMiddle: 1.08,
};
const result = getScore(input, BEST_PARAMS);
console.log(result.toFixed(2));
