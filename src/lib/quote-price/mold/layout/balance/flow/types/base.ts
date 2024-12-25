/**
 * 基础评分接口
 */
export interface BaseScore {
  /** 总分 */
  total: number;
  /** 各维度得分 */
  breakdown: Record<string, number>;
}

/**
 * 3D点坐标
 */
export interface Point3D {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
  /** Z坐标 */
  z: number;
}
