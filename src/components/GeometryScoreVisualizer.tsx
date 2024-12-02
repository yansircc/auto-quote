import React, { useMemo } from "react";
import { calculateRectCenter } from "@/lib/algorithm/balance";
import { COLORS } from "@/lib/constants/colors";
import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import { useBalanceStore } from "@/stores/useBalanceStore";
import {
  useViewBoxCalculation,
  useQuadrantCalculation,
  QuadrantLines,
  QuadrantWeightLabels,
  Legend,
  type LayoutItem,
  type LegendConfig,
} from "./base/BaseScoreVisualizer";

interface GeometryScoreVisualizerProps {
  layout: Rectangle[];
  products: Product[];
  width?: number;
  height?: number;
}

export const GeometryScoreVisualizer: React.FC<
  GeometryScoreVisualizerProps
> = ({ layout, products, width = 800, height = 600 }) => {
  // Get score from store
  const { score } = useBalanceStore();

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

      return {
        center: calculateRectCenter(rect),
        weight: product.weight ?? 0,
        dimensions: rect,
      };
    });
  }, [layout, products]);

  // Calculate quadrant data
  const { centerOfMass, quadrantWeights } = useQuadrantCalculation(
    centers,
    viewBoxData.originPoint,
  );

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      {
        color: COLORS.visualization.accent,
        label: "产品重心",
      },
      {
        color: COLORS.visualization.highlight,
        label: "整体重心",
      },
      {
        color: COLORS.visualization.gray,
        label: "象限分界线",
      },
    ],
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
              height={rect.length}
              className="stroke-green-500"
              fill={COLORS.success.light}
              strokeWidth={1 / viewBoxData.scale}
              fillOpacity={0.2}
            />
          </g>
        ))}

        {/* 象限分界线 */}
        <QuadrantLines
          centerPoint={centerOfMass}
          viewBox={viewBoxData.viewBox}
          scale={viewBoxData.scale}
        />

        {/* 象限权重标签 */}
        <QuadrantWeightLabels
          centerPoint={centerOfMass}
          quadrantWeights={quadrantWeights}
          viewBox={viewBoxData.viewBox}
          scale={viewBoxData.scale}
          format={(weight) => `${weight.toFixed(1)}%`}
          showLabels={true}
        />

        {/* 产品重心 */}
        {centers.map((item, index) => (
          <circle
            key={`center-${index}`}
            cx={item.center.x}
            cy={item.center.y}
            r={3 / viewBoxData.scale}
            fill={COLORS.visualization.accent}
            fillOpacity={0.8}
          />
        ))}

        {/* 整体重心 */}
        <circle
          cx={centerOfMass.x}
          cy={centerOfMass.y}
          r={5 / viewBoxData.scale}
          fill={COLORS.visualization.highlight}
          stroke="white"
          strokeWidth={2 / viewBoxData.scale}
        />
      </svg>

      {/* 图例 */}
      <Legend config={legendConfig} />

      {/* 分数展示 */}
      {score && (
        <div className="absolute right-4 top-4 rounded bg-white/80 p-4 shadow-sm">
          <div className="space-y-2 text-sm">
            <div>径向平衡: {score.details.geometry.toFixed(1)}</div>
            <div>象限平衡: {score.total.toFixed(1)}</div>
            <div>中心偏移: {score.total.toFixed(1)}</div>
            <div className="font-bold">总分: {score.total.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
