import React, { useMemo } from 'react';
import { calculateRectCenter } from '@/lib/algorithm/balance/utils/geometry';
import { COLORS } from '@/lib/constants/colors';
import {
  type BaseVisualizerProps,
  type LayoutItem,
  type LegendConfig,
  useViewBoxCalculation,
  useQuadrantCalculation,
  QuadrantLines,
  QuadrantWeightLabels,
  Legend,
} from './base/BaseScoreVisualizer';
import { type Point2D } from '@/lib/algorithm/types';

interface FlowVisualizerProps extends BaseVisualizerProps {
  injectionPoint: Point2D;
}

export const FlowScoreVisualizer: React.FC<FlowVisualizerProps> = ({
  layout,
  products,
  injectionPoint,
  width = 800,
  height = 600,
}) => {
  // Calculate visualization parameters
  const viewBoxData = useViewBoxCalculation(layout, width, height);
  
  // Calculate centers and weights
  const centers: LayoutItem[] = useMemo(() => {
    if (layout.length !== products.length) {
      console.error('Layout and products arrays must have the same length');
      return [];
    }
    
    return layout.map((rect, i) => {
      const product = products[i];
      if (!product) {
        console.error(`No product found at index ${i}`);
        return {
          center: calculateRectCenter(rect),
          weight: 0,
          dimensions: rect,
        };
      }
      
      return {
        center: calculateRectCenter(rect),
        // For flow score, we use flow length as weight, default to 0 if not available
        weight: product?.flowLength ?? 0,
        dimensions: rect,
      };
    });
  }, [layout, products]);

  // Calculate quadrant data
  const { quadrantWeights } = useQuadrantCalculation(centers, viewBoxData.originPoint);

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      { color: '#22C55E', label: '注塑点' },  // green-500
      { color: '#3B82F6', label: '产品中心' },  // blue-500
      { color: '#F59E0B', label: '流动路径' },  // amber-500
    ]
  };

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`${viewBoxData.viewBox.x} ${viewBoxData.viewBox.y} ${viewBoxData.viewBox.width} ${viewBoxData.viewBox.height}`}
        className="absolute inset-0"
      >
        <QuadrantLines
          centerPoint={injectionPoint}
          viewBox={viewBoxData.viewBox}
          scale={viewBoxData.scale}
        />

        {/* Draw product outlines */}
        {layout.map((rect, i) => (
          <rect
            key={i}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            className="stroke-blue-500"
            fill={COLORS.primary.light}
            strokeWidth={1/viewBoxData.scale}
            fillOpacity={0.2}
          />
        ))}

        {/* Draw flow paths */}
        {centers.map((c, i) => (
          <g key={i}>
            {/* Flow path line */}
            <line
              x1={injectionPoint.x}
              y1={injectionPoint.y}
              x2={c.center.x}
              y2={c.center.y}
              className="stroke-amber-500"
              strokeWidth={1/viewBoxData.scale}
              strokeDasharray={`${4/viewBoxData.scale},${4/viewBoxData.scale}`}
              strokeOpacity={0.6}
            />

            {/* Product center */}
            <circle
              cx={c.center.x}
              cy={c.center.y}
              r={3/viewBoxData.scale}
              className="fill-blue-500"
              fillOpacity={0.6}
            />
            
            {/* Flow length label */}
            <text
              x={c.center.x}
              y={c.center.y - 8/viewBoxData.scale}
              className="fill-slate-600"
              style={{
                fontSize: `${10/viewBoxData.scale}px`,
                textAnchor: 'middle',
              }}
            >
              {c.weight.toFixed(1)}mm
            </text>
          </g>
        ))}

        {/* Draw injection point */}
        <circle
          cx={injectionPoint.x}
          cy={injectionPoint.y}
          r={5/viewBoxData.scale}
          className="fill-green-500 stroke-white"
          strokeWidth={2/viewBoxData.scale}
        />

        <QuadrantWeightLabels
          centerPoint={injectionPoint}
          quadrantWeights={quadrantWeights}
          viewBox={viewBoxData.viewBox}
          scale={viewBoxData.scale}
          showLabels={false}  // 不显示四象限权重标签
        />
      </svg>

      <Legend config={legendConfig} />
    </div>
  );
};