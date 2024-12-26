import { calculateMinArea } from "@/lib/quote-price/mold/layout/min-area";
import {
  getAspectRatioScore,
  ASPECT_RATIO_BEST_PARAMS,
  type AspectRatioInput,
} from "../optimizer";
import type { BaseCuboid } from "../types";

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
function calculateAspectRatioMetrics(cuboids: BaseCuboid[]): AspectRatioInput {
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
 * 计算长宽比得分
 *
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns 长宽比得分
 */
function scorer(cuboids: BaseCuboid[], bestParams = ASPECT_RATIO_BEST_PARAMS) {
  const aspectRatio = calculateAspectRatioMetrics(cuboids);
  const score = getAspectRatioScore(aspectRatio, bestParams);
  return score;
}

export { scorer as aspectRatioScorer };
