import { create } from "zustand";
import type { Product } from "@/types/domain/product";
import type { Rectangle, Point2D } from "@/types/core/geometry";
import type {
  BalanceScore,
  DetailedGeometryScore,
  DetailedFlowScore,
} from "@/types/algorithm";
import {
  calculateDetailedGeometryScore,
  calculateDetailedFlowScore,
  calculateDistributionScore,
  calculateVolumeScore,
  calculateBalanceScore,
} from "@/lib/algorithm/balance";

interface BalanceState {
  // Scores
  overallScore: BalanceScore | null;
  geometryScore: DetailedGeometryScore | null;
  flowScore: DetailedFlowScore | null;
  distributionScore: number | null;
  volumeScore: number | null;

  // Input data
  layout: Rectangle[] | null;
  products: Product[] | null;
  injectionPoint: Point2D | null;

  // Actions
  calculateScores: (
    layout: Rectangle[],
    products: Product[],
    injectionPoint: Point2D,
  ) => void;
  resetScores: () => void;
}

/**
 * 平衡分析状态管理
 * Balance analysis state management store
 */
export const useBalanceStore = create<BalanceState>((set) => ({
  // Initial state
  overallScore: null,
  geometryScore: null,
  flowScore: null,
  distributionScore: null,
  volumeScore: null,
  layout: null,
  products: null,
  injectionPoint: null,

  // Calculate all scores
  calculateScores: (layout, products, injectionPoint) => {
    const geometryScore = calculateDetailedGeometryScore(layout, products);
    const flowScore = calculateDetailedFlowScore(
      layout,
      products,
      injectionPoint,
    );
    const distributionScore = calculateDistributionScore(layout, products);
    const volumeScore = calculateVolumeScore(layout, products);
    const overallScore = calculateBalanceScore(
      layout,
      products,
      injectionPoint,
    );

    set({
      overallScore,
      geometryScore,
      flowScore,
      distributionScore,
      volumeScore,
      layout,
      products,
      injectionPoint,
    });
  },

  // Reset all scores
  resetScores: () => {
    set({
      overallScore: null,
      geometryScore: null,
      flowScore: null,
      distributionScore: null,
      volumeScore: null,
      layout: null,
      products: null,
      injectionPoint: null,
    });
  },
}));
