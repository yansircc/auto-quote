import React, { useMemo } from 'react';
import { calculateRectCenter } from '@/lib/algorithm/balance/utils/geometry';
import { COLORS } from '@/lib/constants/colors';
import {
  useViewBoxCalculation,
  useQuadrantCalculation,
  QuadrantLines,
  QuadrantWeightLabels,
  Legend,
  type BaseVisualizerProps,
  type LayoutItem,
  type LegendConfig,
} from './base/BaseScoreVisualizer';

export const GeometryScoreVisualizer: React.FC<BaseVisualizerProps> = ({
  layout,
  products,
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
        weight: product.weight ?? 0,
        dimensions: rect,
      };
    });
  }, [layout, products]);

  // Calculate quadrant data
  const { centerOfMass, quadrantWeights } = useQuadrantCalculation(centers, viewBoxData.originPoint);

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      { color: '#EF4444', label: '质心' },  // red-500
      { color: '#3B82F6', label: '产品中心' },  // blue-500
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
          centerPoint={centerOfMass}
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

        {/* Draw product centers and weights */}
        {centers.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.center.x}
              cy={c.center.y}
              r={3/viewBoxData.scale}
              className="fill-blue-500"
              fillOpacity={0.6}
            />
            <text
              x={c.center.x}
              y={c.center.y - 8/viewBoxData.scale}
              className="fill-slate-600"
              style={{
                fontSize: `${10/viewBoxData.scale}px`,
                textAnchor: 'middle',
              }}
            >
              {c.weight}g
            </text>
          </g>
        ))}

        {/* Draw center of mass */}
        <circle
          cx={centerOfMass.x}
          cy={centerOfMass.y}
          r={5/viewBoxData.scale}
          className="fill-red-500 stroke-white"
          strokeWidth={2/viewBoxData.scale}
        />

        <QuadrantWeightLabels
          centerPoint={centerOfMass}
          quadrantWeights={quadrantWeights}
          viewBox={viewBoxData.viewBox}
          scale={viewBoxData.scale}
          format={(weight) => `${weight.toFixed(1)}%`}
          showLabels={true}
        />
      </svg>

      <Legend config={legendConfig} />
    </div>
  );
};
