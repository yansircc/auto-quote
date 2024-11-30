"use client";
import { useMemo } from 'react';
import { type Rectangle, type Point2D, type Product } from '@/lib/algorithm/types';
import { 
  calculateDetailedGeometryScore,
  calculateDetailedFlowScore,
  calculateDistributionScore,
  calculateVolumeScore
} from '@/lib/algorithm/balance/score';
import { GeometryScoreVisualizer } from './GeometryScoreVisualizer';
import { FlowScoreVisualizer } from './FlowScoreVisualizer';
import { DistributionScoreVisualizer } from './DistributionScoreVisualizer';
import { VolumeScoreVisualizer } from './VolumeScoreVisualizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BalanceAnalyzerProps {
  layout: Rectangle[];
  products: Product[];
  injectionPoint: Point2D;
  width?: number;
  height?: number;
}

/**
 * 布局平衡分析主组件
 * Main component for analyzing layout balance
 */
export function BalanceAnalyzer({
  layout,
  products,
  injectionPoint,
  width = 800,
  height = 600
}: BalanceAnalyzerProps) {
  // Calculate detailed scores
  // 计算详细分数
  const scores = useMemo(() => ({
    geometry: calculateDetailedGeometryScore(layout, products),
    flow: calculateDetailedFlowScore(layout, products, injectionPoint),
    distribution: calculateDistributionScore(layout, products)
  }), [layout, products, injectionPoint]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800">布局平衡分析</h2>
      
      <Tabs defaultValue="geometry" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geometry">几何平衡</TabsTrigger>
          <TabsTrigger value="flow">流动平衡</TabsTrigger>
          <TabsTrigger value="distribution">分布平衡</TabsTrigger>
          <TabsTrigger value="volume">体积利用</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geometry" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <GeometryScoreVisualizer
              layout={layout}
              products={products}
              width={width}
              height={height}
            />
          </div>
        </TabsContent>

        <TabsContent value="flow" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <FlowScoreVisualizer
              layout={layout}
              products={products}
              injectionPoint={injectionPoint}
              width={width}
              height={height}
            />
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DistributionScoreVisualizer
              layout={layout}
              products={products}
              width={width}
              height={height}
            />
          </div>
        </TabsContent>

        <TabsContent value="volume" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <VolumeScoreVisualizer
              layout={layout}
              products={products}
              width={width}
              height={height}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">几何平衡</h3>
          <p className="text-3xl font-bold text-blue-600">{scores.geometry.overall.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">流动平衡</h3>
          <p className="text-3xl font-bold text-blue-600">{scores.flow.overall.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">分布平衡</h3>
          <p className="text-3xl font-bold text-blue-600">{scores.distribution.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">体积利用</h3>
          <p className="text-3xl font-bold text-blue-600">{calculateVolumeScore(layout, products).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
