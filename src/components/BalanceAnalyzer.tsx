"use client";
import React, { useEffect } from "react";
import { GeometryScoreVisualizer } from "./GeometryScoreVisualizer";
import { FlowScoreVisualizer } from "./FlowScoreVisualizer";
import { DistributionScoreVisualizer } from "./DistributionScoreVisualizer";
import { ScoreCard } from "./ScoreCard";
import { useBalanceStore } from "@/stores/useBalanceStore";
import type { Rectangle, Point2D } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
interface BalanceAnalyzerProps {
  layout: Rectangle[];
  products: Product[];
  injectionPoint: Point2D;
  renderScore?: (
    type: "geometry" | "flow" | "volume" | "distribution",
    score: number,
  ) => React.ReactNode;
}

/**
 * 布局平衡分析主组件
 * Main component for analyzing layout balance
 */
export const BalanceAnalyzer: React.FC<BalanceAnalyzerProps> = ({
  layout,
  products,
  injectionPoint,
  renderScore,
}) => {
  const { calculateScores, score } = useBalanceStore();

  // Calculate scores when inputs change
  useEffect(() => {
    calculateScores(layout, products, injectionPoint);
  }, [layout, products, injectionPoint, calculateScores]);

  if (!score) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-800">
            布局平衡分析
          </h2>

          <div className="space-y-8">
            <ScoreCard score={score} />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">几何平衡</h3>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-1 text-sm font-medium text-slate-600">
                  几何平衡
                </h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore
                    ? renderScore("geometry", score.details.geometry)
                    : score.details.geometry.toFixed(1)}
                </div>
              </div>
              <GeometryScoreVisualizer layout={layout} products={products} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">流动平衡</h3>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-1 text-sm font-medium text-slate-600">
                  流动平衡
                </h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore
                    ? renderScore("flow", score.details.flow)
                    : score.details.flow.toFixed(1)}
                </div>
              </div>
              <FlowScoreVisualizer
                layout={layout}
                products={products}
                injectionPoint={injectionPoint}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">分布平衡</h3>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-1 text-sm font-medium text-slate-600">
                  分布平衡
                </h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore
                    ? renderScore("distribution", score.details.distribution)
                    : score.details.distribution.toFixed(1)}
                </div>
              </div>
              <DistributionScoreVisualizer
                layout={layout}
                products={products}
              />
            </div>
          </div>
        </div>

        <div className="w-80">
          <ScoreCard score={score} />
        </div>
      </div>
    </div>
  );
};
