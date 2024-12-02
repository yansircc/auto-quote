import React, { useMemo } from "react";
import { COLORS } from "@/lib/constants/colors";
import type { Rectangle, Point2D } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import { useBalanceStore } from "@/stores/useBalanceStore";
import {
  calculateRectCenter,
  calculateFlowPathInfo,
} from "@/lib/utils/geometry";
import {
  type LayoutItem,
  type LegendConfig,
  useViewBoxCalculation,
  Legend,
} from "./base/BaseScoreVisualizer";

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
  // 获取评分数据
  const { score } = useBalanceStore();

  // 计算视图参数
  const viewBoxData = useViewBoxCalculation(layout, width, height);

  // 计算布局项目
  const layoutItems: LayoutItem[] = useMemo(() => {
    if (layout.length !== products.length) return [];

    return layout.map((rect, i) => {
      const product = products[i];
      if (!product)
        return {
          center: calculateRectCenter(rect),
          weight: 0,
          dimensions: rect,
        };

      // 计算流动路径信息
      const flowInfo = calculateFlowPathInfo(product, rect, injectionPoint);

      // 如果有手动设置的流动长度，使用手动值
      const flowLength = product.flowData?.manualFlowLength ?? flowInfo.length;

      return {
        center: calculateRectCenter(rect),
        weight: product.weight ?? 1,
        dimensions: rect,
        flowLength,
        flowPath: flowInfo.path,
      };
    });
  }, [layout, products, injectionPoint]);

  // 图例配置
  const legendConfig: LegendConfig = {
    items: [
      {
        color: COLORS.visualization.accent,
        label: "产品重心",
      },
      {
        color: COLORS.visualization.highlight,
        label: "注塑点",
      },
      {
        color: COLORS.visualization.gray,
        label: "流道长度",
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

        {/* 注塑点 */}
        <circle
          cx={injectionPoint.x}
          cy={injectionPoint.y}
          r={5 / viewBoxData.scale}
          fill={COLORS.visualization.highlight}
        />

        {/* 流道路径和产品重心 */}
        {layoutItems.map((item, index) => (
          <g key={`flow-${index}`}>
            {/* 流道路径线 */}
            <line
              x1={injectionPoint.x}
              y1={injectionPoint.y}
              x2={item.center.x}
              y2={item.center.y}
              stroke={COLORS.visualization.gray}
              strokeWidth={1 / viewBoxData.scale}
              strokeDasharray={`${4 / viewBoxData.scale},${4 / viewBoxData.scale}`}
            />
            {/* 产品重心点 */}
            <circle
              cx={item.center.x}
              cy={item.center.y}
              r={3 / viewBoxData.scale}
              fill={COLORS.visualization.accent}
            />
          </g>
        ))}
      </svg>

      <Legend config={legendConfig} />

      {/* 分数展示 */}
      {score && (
        <div className="absolute right-4 top-4 rounded bg-white/80 p-4 shadow-sm">
          <div className="space-y-2 text-sm">
            <div>流道平衡: {score.details.flow.toFixed(1)}</div>
            <div>表面积平衡: {score.details.geometry.toFixed(1)}</div>
            <div>分布平衡: {score.details.distribution.toFixed(1)}</div>
            <div className="font-bold">总分: {score.total.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
