/**
 * 对称性评分系统
 *
 * 评分维度：
 * 1. 轴向对称性
 *    - 评估X、Y、Z轴的对称性
 *    - 检查镜像位置是否有对应的长方体
 *    - 计算与完美对称的偏差
 *
 * 2. 重心对称性
 *    - 分析重心位置
 *    - 评估整体重量分布
 *    - 考虑模具开合方向的对称性
 */

import { createNormalizer, PARAM_PREFIX } from "../shared";
import { getBoundingBox } from "../../../packing";
import type { CuboidLayout } from "../../../types";
import {
  getSymmetryScore,
  SYMMETRY_BEST_PARAMS,
} from "../../optimizer/symmetry";

/**
 * 获取轴向对称性
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 轴向对称性得分
 */
function getAxialSymmetry(layout: CuboidLayout[]): number {
  const boundingBox = getBoundingBox(layout);

  if (!boundingBox || layout.length < 2) return 0;

  // 1. 计算包围盒的中心点
  const center = {
    x: boundingBox.dimensions.width / 2,
    y: boundingBox.dimensions.depth / 2,
    z: boundingBox.dimensions.height / 2,
  };

  // 2. 计算每个轴向的对称性偏差
  const axialDeviations = {
    x: 0,
    y: 0,
    z: 0,
  };

  layout.forEach((cube1) => {
    // 计算当前立方体的中心点
    const cube1Center = {
      x: cube1.position.x + cube1.dimensions.width / 2,
      y: cube1.position.y + cube1.dimensions.depth / 2,
      z: cube1.position.z + cube1.dimensions.height / 2,
    };

    // 计算镜像位置
    const mirrorPoint = {
      x: 2 * center.x - cube1Center.x,
      y: 2 * center.y - cube1Center.y,
      z: 2 * center.z - cube1Center.z,
    };

    // 寻找最近的对称体
    const minDistances = {
      x: Number.MAX_VALUE,
      y: Number.MAX_VALUE,
      z: Number.MAX_VALUE,
    };

    layout.forEach((cube2) => {
      if (cube1 === cube2) return;

      const cube2Center = {
        x: cube2.position.x + cube2.dimensions.width / 2,
        y: cube2.position.y + cube2.dimensions.depth / 2,
        z: cube2.position.z + cube2.dimensions.height / 2,
      };

      minDistances.x = Math.min(
        minDistances.x,
        Math.abs(mirrorPoint.x - cube2Center.x),
      );
      minDistances.y = Math.min(
        minDistances.y,
        Math.abs(mirrorPoint.y - cube2Center.y),
      );
      minDistances.z = Math.min(
        minDistances.z,
        Math.abs(mirrorPoint.z - cube2Center.z),
      );
    });

    // 累加偏差
    axialDeviations.x += minDistances.x / boundingBox.dimensions.width;
    axialDeviations.y += minDistances.y / boundingBox.dimensions.depth;
    axialDeviations.z += minDistances.z / boundingBox.dimensions.height;
  });

  // 3. 计算平均偏差
  const avgDeviation =
    (axialDeviations.x + axialDeviations.y + axialDeviations.z) /
    (3 * layout.length);

  return avgDeviation;
}

/**
 * 获取重心对称性
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 重心对称性得分
 */
function getMassSymmetry(layout: CuboidLayout[]): number {
  const boundingBox = getBoundingBox(layout);

  if (!boundingBox || layout.length < 2) return 0;

  // 1. 计算总重心
  const totalMass = {
    mass: 0,
    x: 0,
    y: 0,
    z: 0,
  };

  layout.forEach((cube) => {
    const mass =
      cube.dimensions.width * cube.dimensions.depth * cube.dimensions.height;
    const centerX = cube.position.x + cube.dimensions.width / 2;
    const centerY = cube.position.y + cube.dimensions.depth / 2;
    const centerZ = cube.position.z + cube.dimensions.height / 2;

    totalMass.mass += mass;
    totalMass.x += mass * centerX;
    totalMass.y += mass * centerY;
    totalMass.z += mass * centerZ;
  });

  const centerOfMass = {
    x: totalMass.x / totalMass.mass,
    y: totalMass.y / totalMass.mass,
    z: totalMass.z / totalMass.mass,
  };

  // 2. 计算理想重心位置（包围盒中心）
  const idealCenter = {
    x: boundingBox.dimensions.width / 2,
    y: boundingBox.dimensions.depth / 2,
    z: boundingBox.dimensions.height / 2,
  };

  // 3. 计算重心偏差（归一化到包围盒尺寸）
  const deviation = Math.sqrt(
    Math.pow(
      (centerOfMass.x - idealCenter.x) / boundingBox.dimensions.width,
      2,
    ) +
      Math.pow(
        (centerOfMass.y - idealCenter.y) / boundingBox.dimensions.depth,
        2,
      ) +
      Math.pow(
        (centerOfMass.z - idealCenter.z) / boundingBox.dimensions.height,
        2,
      ),
  );

  return deviation;
}

/**
 * 归一化形状相似度
 */
const symmetryNormalizer = {
  axial: createNormalizer({
    prefix: PARAM_PREFIX.AXIAL,
    inverse: true, // 越小越好
  }),
  mass: createNormalizer({
    prefix: PARAM_PREFIX.MASS,
    inverse: true, // 越小越好
  }),
};

/**
 * 计算对称性得分
 *
 * @param {CuboidLayout[]} optimizedCuboidsLayout - 立方体布局
 * @param bestParams - 最佳参数
 * @returns {number} 对称性得分
 */
function scorer(
  optimizedCuboidsLayout: CuboidLayout[],
  bestParams = SYMMETRY_BEST_PARAMS,
): number {
  const axial = getAxialSymmetry(optimizedCuboidsLayout);
  const mass = getMassSymmetry(optimizedCuboidsLayout);
  const normalizedMetrics = {
    axial: symmetryNormalizer.axial(axial, bestParams),
    mass: symmetryNormalizer.mass(mass, bestParams),
  };
  return getSymmetryScore(normalizedMetrics, bestParams);
}

export { scorer as symmetryScorer };
