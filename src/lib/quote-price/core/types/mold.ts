import type { BaseMold } from "./base";

export interface MoldWithCavities extends BaseMold {
  cavities: Record<string, number>; // 产品上的穴号索引到模具上的穴号索引的映射
}
