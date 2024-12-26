export { PARAM_PREFIX } from "@/lib/quote-price/mold/layout/balance/optimizer";
export type { BaseCuboid } from "@/lib/quote-price/mold/layout/balance/types";

/**
 * 3D布局结果，使用笛卡尔坐标系
 */
export interface CuboidLayout {
  dimensions: {
    width: number; // x
    depth: number; // y
    height: number; // z
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  index: number; // 保留原始索引
}
