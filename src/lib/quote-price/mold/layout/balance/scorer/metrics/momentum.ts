/**
 * 动量平衡评分系统
 *
 * 考虑型腔（空腔）特性的力矩平衡计算：
 * 1. 型腔力矩比率 (Cavity Torque Ratio)
 *    - 计算各方向的力矩，考虑型腔的"负质量"效应
 *    - 评估三个方向的力矩平衡性
 *
 * 2. 型腔分布均匀性 (Cavity Distribution)
 *    - 评估型腔在空间中的分布情况
 *    - 考虑型腔间的相对位置关系
 */

import {
  createNormalizer,
  getTopAlignedCuboidsLayout,
  type BaseCuboid,
} from "../shared";
import {
  getMomentumScore,
  MOMENTUM_BEST_PARAMS,
  PARAM_PREFIX,
} from "../../optimizer";

/**
 * 计算型腔力矩比率
 * 返回真实的物理量，不做归一化处理
 */
function getCavityTorqueRatio(cuboids: BaseCuboid[]): number {
  const layout = getTopAlignedCuboidsLayout(cuboids);
  const moments = { x: 0, y: 0, z: 0 };

  // 1. 计算总体积和质心
  let totalVolume = 0;
  const centerOfMass = { x: 0, y: 0, z: 0 };

  layout.forEach((cavity) => {
    const volume =
      cavity.dimensions.width *
      cavity.dimensions.depth *
      cavity.dimensions.height;
    totalVolume += volume;

    centerOfMass.x +=
      volume * (cavity.position.x + cavity.dimensions.width / 2);
    centerOfMass.y +=
      volume * (cavity.position.y + cavity.dimensions.depth / 2);
    centerOfMass.z +=
      volume * (cavity.position.z + cavity.dimensions.height / 2);
  });

  centerOfMass.x /= totalVolume;
  centerOfMass.y /= totalVolume;
  centerOfMass.z /= totalVolume;

  // 2. 计算特征尺度（用于归一化）
  const characteristicLength = Math.cbrt(totalVolume);

  // 3. 计算归一化力矩
  layout.forEach((cavity) => {
    const volume =
      cavity.dimensions.width *
      cavity.dimensions.depth *
      cavity.dimensions.height;

    // 计算相对于质心的距离，并用特征尺度归一化
    const x =
      (cavity.position.x + cavity.dimensions.width / 2 - centerOfMass.x) /
      characteristicLength;
    const y =
      (cavity.position.y + cavity.dimensions.depth / 2 - centerOfMass.y) /
      characteristicLength;
    const z =
      (cavity.position.z + cavity.dimensions.height / 2 - centerOfMass.z) /
      characteristicLength;

    // 使用归一化的体积和距离
    const normalizedVolume = Math.pow(volume / totalVolume, 0.5);

    moments.x += normalizedVolume * Math.abs(x);
    moments.y += normalizedVolume * Math.abs(y);
    moments.z += normalizedVolume * Math.abs(z);
  });

  // 4. 计算真实的力矩比率
  const momentValues = Object.values(moments).filter((m) => m > 0.01);
  if (momentValues.length < 2) return 1;

  const max = Math.max(...momentValues);
  const min = Math.min(...momentValues);

  // 返回真实的力矩比率
  return max / min;
}

/**
 * 计算型腔分布均匀性
 * - 评估型腔在空间中的分布情况
 * - 考虑型腔间的相对位置关系
 * 返回真实的相对标准差（RSD），不做归一化处理
 */
function getCavityDistribution(cuboids: BaseCuboid[]): number {
  const layout = getTopAlignedCuboidsLayout(cuboids);
  const contributions: number[] = [];

  // 1. 计算质心
  const centerOfMass = {
    x: 0,
    y: 0,
    z: 0,
    totalMass: 0,
  };

  layout.forEach((cavity) => {
    const mass =
      cavity.dimensions.width *
      cavity.dimensions.depth *
      cavity.dimensions.height;

    centerOfMass.x += mass * (cavity.position.x + cavity.dimensions.width / 2);
    centerOfMass.y += mass * (cavity.position.y + cavity.dimensions.depth / 2);
    centerOfMass.z += mass * (cavity.position.z + cavity.dimensions.height / 2);
    centerOfMass.totalMass += mass;
  });

  centerOfMass.x /= centerOfMass.totalMass;
  centerOfMass.y /= centerOfMass.totalMass;
  centerOfMass.z /= centerOfMass.totalMass;

  // 2. 计算相对于质心的分布
  layout.forEach((cavity) => {
    const mass =
      cavity.dimensions.width *
      cavity.dimensions.depth *
      cavity.dimensions.height;

    const x = cavity.position.x + cavity.dimensions.width / 2 - centerOfMass.x;
    const y = cavity.position.y + cavity.dimensions.depth / 2 - centerOfMass.y;
    const z = cavity.position.z + cavity.dimensions.height / 2 - centerOfMass.z;

    const distance = Math.sqrt(x * x + y * y + z * z);
    contributions.push(mass * distance);
  });

  if (contributions.length === 0) return 0;

  // 3. 计算相对标准差 (RSD)
  const mean =
    contributions.reduce((sum, val) => sum + val, 0) / contributions.length;

  const variance =
    contributions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    contributions.length;

  // 返回真实的相对标准差
  return Math.sqrt(variance) / mean;
}

/**
 * 归一化动量评分
 */
const momentumNormalizer = {
  ratio: createNormalizer({
    prefix: PARAM_PREFIX.RATIO,
    inverse: false, // 越大越好
  }),
  rsd: createNormalizer({
    prefix: PARAM_PREFIX.RSD,
    inverse: true, // 越小越好
  }),
};

/**
 * 综合评分函数
 */
function scorer(cuboids: BaseCuboid[]): number {
  // 1. 计算原始物理量
  const rawRatio = getCavityTorqueRatio(cuboids);
  const rawRSD = getCavityDistribution(cuboids);

  // 2. 归一化
  const normalizedMetrics = {
    ratio: momentumNormalizer.ratio(rawRatio, MOMENTUM_BEST_PARAMS),
    rsd: momentumNormalizer.rsd(rawRSD, MOMENTUM_BEST_PARAMS),
  };

  // 3. 使用评分系统计算最终分数
  return getMomentumScore(normalizedMetrics, MOMENTUM_BEST_PARAMS);
}

export { scorer as momentumScorer };
