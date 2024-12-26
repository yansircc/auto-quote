/**
 * 长宽比评分系统
 *
 * 评分维度：
 * 1. 长宽比（Aspect Ratio）
 *    - 计算长方体长宽比
 *    - 越小越均匀
 */

import { calculateMinArea } from "@/lib/quote-price/mold/layout/min-area";
import {
  getAspectRatioScore,
  ASPECT_RATIO_BEST_PARAMS,
  PARAM_PREFIX,
} from "../../optimizer";
import type { BaseCuboid } from "../../types";
import { createNormalizer } from "../shared";

/**
 * 获取最小维度
 *
 * @param cuboids - 一组立方体
 * @returns {BaseCuboid} 最小维度
 */
function getMinDimension(cuboids: BaseCuboid[]): BaseCuboid {
  const rectangles = cuboids.map((cuboid) => ({
    width: cuboid.width,
    height: cuboid.depth,
  }));

  const maxHeight = Math.max(...cuboids.map((cuboid) => cuboid.height));
  const { width, height: depth } = calculateMinArea(rectangles);

  return {
    width,
    depth,
    height: maxHeight,
  };
}

/**
 * 采用最小面积函数，计算一组立方体的整体长宽比
 *
 * @param cuboids - 一组立方体
 * @returns {AspectRatioInput} 整体长宽比
 */
function getAspectRatioMetrics(cuboids: BaseCuboid[]) {
  const { width, depth, height } = getMinDimension(cuboids);

  // 先把所有维度放入数组，然后排序
  const dimensions = [
    { value: width, type: "width" },
    { value: depth, type: "depth" },
    { value: height, type: "height" },
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
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns 长宽比得分
 */
function aspectRatioScorer(
  cuboids: BaseCuboid[],
  bestParams = ASPECT_RATIO_BEST_PARAMS,
) {
  const aspectRatio = getAspectRatioMetrics(cuboids);
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
