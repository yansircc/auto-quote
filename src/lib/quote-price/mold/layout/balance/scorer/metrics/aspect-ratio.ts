/**
 * 长宽比评分系统
 *
 * 评分维度：
 * 1. 长宽比（Aspect Ratio）
 *    - 计算长方体长宽比
 *    - 越小越均匀
 */

import {
  getAspectRatioScore,
  ASPECT_RATIO_BEST_PARAMS,
  PARAM_PREFIX,
} from "../../optimizer";
import { createNormalizer } from "../shared";
import { getBoundingBox } from "../../../packing";
import type { CuboidLayout } from "../../../types";

/**
 * 采用最小面积函数，计算一组立方体的整体长宽比
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {AspectRatioInput} 整体长宽比
 */
function getAspectRatioMetrics(layout: CuboidLayout[]) {
  // 计算包围盒
  const boundingBox = getBoundingBox(layout);

  // 计算长宽比，先把所有维度放入数组，然后排序
  const dimensions = [
    { value: boundingBox.dimensions.width, type: "width" },
    { value: boundingBox.dimensions.depth, type: "depth" },
    { value: boundingBox.dimensions.height, type: "height" },
  ].sort((a, b) => b.value - a.value);

  // 现在我们可以清楚地知道每个维度的原始含义
  const [longest, middle, shortest] = dimensions.map((d) => d.value) as [
    number,
    number,
    number,
  ];

  // 用于调试
  // console.log(
  //   `Longest: ${dimensions[0]?.type}, Middle: ${dimensions[1]?.type}, Shortest: ${dimensions[2]?.type}`,
  // );

  return {
    longestToShortest: longest / shortest,
    middleToShortest: middle / shortest,
    longestToMiddle: longest / middle,
  };
}

/**
 * 归一化长宽比
 */
const aspectRatioNormalizer = {
  longestToShortest: createNormalizer({
    prefix: PARAM_PREFIX.LONGEST_TO_SHORTEST,
    inverse: true, // 越小越好
  }),
  middleToShortest: createNormalizer({
    prefix: PARAM_PREFIX.MIDDLE_TO_SHORTEST,
    inverse: true, // 越小越好
  }),
  longestToMiddle: createNormalizer({
    prefix: PARAM_PREFIX.LONGEST_TO_MIDDLE,
    inverse: false, // 越大越好
  }),
};

/**
 * 计算长宽比得分
 *
 * @param {CuboidLayout[]} optimizedCuboidsLayout - 优化后的立方体布局
 * @param bestParams - 最佳参数
 * @returns 长宽比得分
 */
function aspectRatioScorer(
  optimizedCuboidsLayout: CuboidLayout[],
  bestParams = ASPECT_RATIO_BEST_PARAMS,
) {
  const aspectRatio = getAspectRatioMetrics(optimizedCuboidsLayout);
  const normalizedMetrics = {
    longestToShortest: aspectRatioNormalizer.longestToShortest(
      aspectRatio.longestToShortest,
      bestParams,
    ),
    middleToShortest: aspectRatioNormalizer.middleToShortest(
      aspectRatio.middleToShortest,
      bestParams,
    ),
    longestToMiddle: aspectRatioNormalizer.longestToMiddle(
      aspectRatio.longestToMiddle,
      bestParams,
    ),
  };
  const score = getAspectRatioScore(normalizedMetrics, bestParams);
  return score;
}

export { aspectRatioScorer };
