import React, { useMemo } from 'react';
import { calculateRectCenter, calculateDistance } from '@/lib/algorithm/balance';
import { COLORS } from '@/lib/constants/colors';
import type { Product, Rectangle, Point2D } from '@/types/geometry';
import { useBalanceStore } from '@/stores/useBalanceStore';
import {

  type LayoutItem,
  type LegendConfig,
  useViewBoxCalculation,
  Legend,
} from './base/BaseScoreVisualizer';

interface FlowScoreVisualizerProps {
  layout: Rectangle[];
  products: Product[];
  injectionPoint: Point2D;
  width?: number;
  height?: number;
}

export const FlowScoreVisualizer: React.FC<FlowScoreVisualizerProps> = ({
  layout,
  products,
  injectionPoint,
  width = 800,
  height = 600,
}) => {
  // Get score from store
  const { flowScore } = useBalanceStore();

  // Calculate visualization parameters
  const viewBoxData = useViewBoxCalculation(layout, width, height);
  
  // Calculate centers and weights
  const centers: LayoutItem[] = useMemo(() => {
    if (layout.length !== products.length) {
      return [];
    }
    
    return layout.map((rect, i) => {
      const product = products[i];
      if (!product) {
        return {
          center: calculateRectCenter(rect),
          weight: 0,
          dimensions: rect,
        };
      }

      const center = calculateRectCenter(rect);
      const flowLength = product.flowLength ?? calculateDistance(injectionPoint, center);

      return {
        center,
        weight: product.weight ?? 1,
        dimensions: rect,
        flowLength,
      };
    });
  }, [layout, products, injectionPoint]);

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      {
        color: COLORS.visualization.accent,
        label: '产品重心',
      },
      {
        color: COLORS.visualization.highlight,
        label: '注塑点',
      },
      {
        color: COLORS.visualization.gray,
        label: '流道长度',
      },
    ]
  };

  return (
    <div className="relative w-full">
      <svg
        width={width}
        height={height}
        viewBox={`${viewBoxData.viewBox.x} ${viewBoxData.viewBox.y} ${viewBoxData.viewBox.width} ${viewBoxData.viewBox.height}`}
        className="border border-slate-300"
      >
        {/* 布局矩形 */}
        {layout.map((rect, index) => (
          <g key={`rect-${index}`}>
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              className="stroke-green-500"
              fill={COLORS.success.light}
              strokeWidth={1/viewBoxData.scale}
              fillOpacity={0.2}
            />
          </g>
        ))}

        {/* 注塑点 */}
        <circle
          cx={injectionPoint.x}
          cy={injectionPoint.y}
          r={5/viewBoxData.scale}
          fill={COLORS.visualization.highlight}
        />

        {/* 流道长度线 */}
        {centers.map((item, index) => (
          <g key={`flow-${index}`}>
            <line
              x1={injectionPoint.x}
              y1={injectionPoint.y}
              x2={item.center.x}
              y2={item.center.y}
              stroke={COLORS.visualization.gray}
              strokeWidth={1/viewBoxData.scale}
              strokeDasharray={`${4/viewBoxData.scale},${4/viewBoxData.scale}`}
            />
            <circle
              cx={item.center.x}
              cy={item.center.y}
              r={3/viewBoxData.scale}
              fill={COLORS.visualization.accent}
            />
          </g>
        ))}
      </svg>

      <Legend config={legendConfig} />

      {/* 分数展示 */}
      {flowScore && (
        <div className="absolute top-4 right-4 bg-white/80 p-4 rounded shadow-sm">
          <div className="text-sm space-y-2">
            <div>流道平衡: {flowScore.flowPathBalance.toFixed(1)}</div>
            <div>表面积平衡: {flowScore.surfaceAreaBalance.toFixed(1)}</div>
            <div>体积平衡: {flowScore.volumeBalance.toFixed(1)}</div>
            <div className="font-bold">总分: {flowScore.overall.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};