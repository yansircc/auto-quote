export interface Product {
  id: number;
  weight: number;
  flowLength?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  cadData?: {
    volume: number;
    surfaceArea: number;
    boundingBox: {
      min: Point3D;
      max: Point3D;
      dimensions: Point3D;
    };
    centerOfMass: Point3D;
  };

  originalIndex?: number;
}

export interface GroupInfo {
  groupId: number;
  weights: number[];
  totalWeight: number;
}

export interface Solution {
  solutionId: number;
  groups: GroupInfo[];
}

export interface Message {
  general: string;
  volumeUtilization?: string;
  solutions: string[];
}

export interface ResponseData {
  weightDiff: number;
  weights: number[];
  message: Message;
  totalSolutions: number;
  solutions: Solution[];
}

export interface MoldDistribution {
  moldId: number;
  products: Product[];
  groupingResult: ResponseData;
}

export interface DistributionSolution {
  solutionId: number;
  molds: MoldDistribution[];
  totalMolds: number;
}

export interface DistributionResult {
  solutions: DistributionSolution[];
  totalSolutions: number;
  message: {
    general: string;
    details?: string[];
  };
}

/**
 * 2D Point representation
 * 二维点表示
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * 3D Point representation
 * 三维点表示
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Vector3D representation
 * 三维向量表示
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D Matrix representation
 * 三维矩阵表示
 */
export interface Matrix3D {
  m11: number; m12: number; m13: number;
  m21: number; m22: number; m23: number;
  m31: number; m32: number; m33: number;
}

/**
 * Rectangle representation for layout
 * 布局中的矩形表示
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  rotated?: boolean;
  originalIndex?: number;
}

/**
 * Area calculation result
 * 面积计算结果
 */
export interface AreaResult {
  length: number;
  width: number;
  area: number;
  rotation: boolean;
  spacing: number;
  layout: Rectangle[];
}

/**
 * Skyline node for packing algorithm
 * 天际线算法的节点
 */
export interface SkylineNode {
  x: number;
  y: number;
  width: number;
}
