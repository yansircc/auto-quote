"use client";
import { useMemo } from 'react';
import { type Rectangle, type Point2D, type Product } from '@/lib/algorithm/types';
import { 
  calculateDetailedGeometryScore,
  calculateDetailedFlowScore
} from '@/lib/algorithm/balance/score';
import { GeometryScoreVisualizer } from './GeometryScoreVisualizer';
import { FlowScoreVisualizer } from './FlowScoreVisualizer';
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
    flow: calculateDetailedFlowScore(layout, products, injectionPoint)
  }), [layout, products, injectionPoint]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800">布局平衡分析</h2>
      
      <Tabs defaultValue="geometry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geometry">几何平衡</TabsTrigger>
          <TabsTrigger value="flow">流动平衡</TabsTrigger>
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
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        {/* 几何平衡分数卡片 */}
        <div className="p-4 rounded-lg bg-white shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-2">几何平衡分数</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">径向平衡</span>
              <span className="font-medium text-slate-800">{scores.geometry.radialBalance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">象限平衡</span>
              <span className="font-medium text-slate-800">{scores.geometry.quadrantBalance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">中心偏移</span>
              <span className="font-medium text-slate-800">{scores.geometry.centerOffset.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-800 font-medium">总体得分</span>
              <span className="font-semibold text-blue-600">{scores.geometry.overall.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 流动平衡分数卡片 */}
        <div className="p-4 rounded-lg bg-white shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-2">流动平衡分数</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">流动路径</span>
              <span className="font-medium text-slate-800">{scores.flow.flowPathBalance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">表面积</span>
              <span className="font-medium text-slate-800">{scores.flow.surfaceAreaBalance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">体积分布</span>
              <span className="font-medium text-slate-800">{scores.flow.volumeBalance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-800 font-medium">总体得分</span>
              <span className="font-semibold text-blue-600">{scores.flow.overall.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
