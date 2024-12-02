import { create } from "zustand";
import type { Product } from "@/types/domain/product";
import type { Rectangle, Point2D } from "@/types/core/geometry";
import type { BalanceScore } from "@/types/algorithm/balance/types";
import { calculateBalanceScore } from "@/lib/algorithm/balance/scores";

interface BalanceState {
  // 评分结果
  score: BalanceScore | null;

  // 输入数据
  layout: Rectangle[] | null;
  products: Product[] | null;
  injectionPoint: Point2D | null;

  // 动作
  calculateScores: (
    layout: Rectangle[],
    products: Product[],
    injectionPoint: Point2D,
  ) => void;
  resetScores: () => void;
}

/**
 * 平衡分析状态管理
 */
export const useBalanceStore = create<BalanceState>((set) => ({
  // 初始状态
  score: null,
  layout: null,
  products: null,
  injectionPoint: null,

  // 计算所有评分
  calculateScores: (layout, products, injectionPoint) => {
    try {
      // 1. 计算总体平衡分数
      const score = calculateBalanceScore(layout, products, injectionPoint);

      // 2. 更新状态
      set({
        score,
        layout,
        products,
        injectionPoint,
      });
    } catch (error) {
      console.error("Error calculating balance scores:", error);
      // 发生错误时重置状态
      set({
        score: null,
        layout,
        products,
        injectionPoint,
      });
    }
  },

  // 重置所有评分
  resetScores: () => {
    set({
      score: null,
      layout: null,
      products: null,
      injectionPoint: null,
    });
  },
}));
