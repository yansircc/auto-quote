"use client";
import React, { useEffect } from 'react';
import { GeometryScoreVisualizer } from './GeometryScoreVisualizer';
import { FlowScoreVisualizer } from './FlowScoreVisualizer';
import { DistributionScoreVisualizer } from './DistributionScoreVisualizer';
import { ScoreCard } from './ScoreCard';
import { useBalanceStore } from '@/stores/useBalanceStore';
import type { Rectangle, Product, Point2D } from '@/types/geometry';

interface BalanceAnalyzerProps {
  layout: Rectangle[];
  products: Product[];
  injectionPoint: Point2D;
  renderScore?: (type: 'geometry' | 'flow' | 'volume' | 'distribution', score: number) => React.ReactNode;
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
  const { 
    calculateScores,
    geometryScore,
    flowScore,
    volumeScore,
    overallScore,
    distributionScore
  } = useBalanceStore();

  // Calculate scores when inputs change
  useEffect(() => {
    calculateScores(layout, products, injectionPoint);
  }, [layout, products, injectionPoint, calculateScores]);

  if (!geometryScore || !flowScore || !overallScore || !distributionScore) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-800">布局平衡分析</h2>
          
          <div className="space-y-8">
            <ScoreCard score={overallScore} />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">几何平衡</h3>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-slate-600 mb-1">几何平衡</h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore ? renderScore('geometry', geometryScore.overall) : geometryScore.overall.toFixed(1)}
                </div>
              </div>
              <GeometryScoreVisualizer 
                layout={layout}
                products={products}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">流动平衡</h3>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-slate-600 mb-1">流动平衡</h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore ? renderScore('flow', flowScore.overall) : flowScore.overall.toFixed(1)}
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
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-slate-600 mb-1">分布平衡</h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore ? renderScore('distribution', distributionScore) : distributionScore.toFixed(1)}
                </div>
              </div>
              <DistributionScoreVisualizer 
                layout={layout}
                products={products}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">体积利用</h3>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-slate-600 mb-1">体积利用</h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {renderScore ? renderScore('volume', volumeScore) : volumeScore.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-80">
          <ScoreCard score={overallScore} />
        </div>
      </div>
    </div>
  );
};
