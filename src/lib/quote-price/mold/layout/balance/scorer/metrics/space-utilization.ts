/**
 * 空间利用率评分系统
 *
 * 评分维度：
 * 1. 体积比率（VolumeRatio）
 *    - 评估立方体总体积与包围盒体积的比率
 *    - 越大越好
 *
 * 2. 长宽比（AspectRatio）
 *    - 评估立方体长宽比
 *    - 越小越好
 */

import {
  createNormalizer,
  getTopAlignedCuboidsLayout,
  getBoundingBox,
  PARAM_PREFIX,
  type BaseCuboid,
} from "../shared";
import {
  getSpaceUtilizationScore,
  SPACE_UTILIZATION_BEST_PARAMS,
} from "../../optimizer/space-utilization";

/**
 * 获取体积比率和长宽比
 *
 * @param cuboids - 一组立方体
 * @returns {number, number} 体积比率，长宽比
 */
function getSpaceUtilizationMetrics(cuboids: BaseCuboid[]): {
  volumeRatio: number;
  aspectRatio: number;
} {
  const layout = getTopAlignedCuboidsLayout(cuboids);

  // 如果没有立方体，返回默认值
  if (layout.length === 0) {
    return {
      volumeRatio: 0,
      aspectRatio: 1,
    };
  }

  // 1. 计算所有立方体的总体积
  const totalVolume = layout.reduce((sum, cuboid) => {
    return (
      sum +
      cuboid.dimensions.width *
        cuboid.dimensions.height *
        cuboid.dimensions.depth
    );
  }, 0);

  // 2. 获取包围盒
  const boundingBox = getBoundingBox(layout);
  const boundingVolume =
    boundingBox.dimensions.width *
    boundingBox.dimensions.height *
    boundingBox.dimensions.depth;

  // 3. 计算体积比率（总体积/包围盒体积）
  const volumeRatio = totalVolume / boundingVolume;

  // 4. 计算长宽比（确保大的除以小的）
  const dimensions = [
    boundingBox.dimensions.width,
    boundingBox.dimensions.height,
    boundingBox.dimensions.depth,
  ].sort((a, b) => b - a); // 降序排列

  const aspectRatio = dimensions[0]! / dimensions[dimensions.length - 1]!;

  return {
    volumeRatio,
    aspectRatio,
  };
}

/**
 * 归一化空间利用率
 */
const spaceUtilizationNormalizer = {
  volumeRatio: createNormalizer({
    prefix: PARAM_PREFIX.VOLUME_RATIO,
    inverse: false, // 越大越好
  }),
  aspectRatio: createNormalizer({
    prefix: PARAM_PREFIX.ASPECT_RATIO,
    inverse: true, // 越小越好
  }),
};

/**
 * 计算空间利用率得分
 *
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns {number} 空间利用率得分
 */
function scorer(
  cuboids: BaseCuboid[],
  bestParams = SPACE_UTILIZATION_BEST_PARAMS,
): number {
  const metrics = getSpaceUtilizationMetrics(cuboids);
  const normalizedMetrics = {
    volumeRatio: spaceUtilizationNormalizer.volumeRatio(
      metrics.volumeRatio,
      bestParams,
    ),
    aspectRatio: spaceUtilizationNormalizer.aspectRatio(
      metrics.aspectRatio,
      bestParams,
    ),
  };
  return getSpaceUtilizationScore(normalizedMetrics, bestParams);
}

export { scorer as spaceUtilizationScorer };
