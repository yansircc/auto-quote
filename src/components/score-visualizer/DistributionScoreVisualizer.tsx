import React, { useMemo } from "react";
import { calculate2DCenter } from "@/lib/utils/coordinate";
import { calculateDistributionScore } from "@/lib/algorithm/balance/scores/distribution";
import { COLORS } from "@/lib/quote-price/core/colors";
import {
  type BaseVisualizerProps,
  Annotation,
  type AnnotationConfig,
  Legend,
  type LegendConfig,
  useViewBoxCalculation,
} from "./base/BaseScoreVisualizer";

export const DistributionScoreVisualizer: React.FC<BaseVisualizerProps> = ({
  layout,
  products,
  width = 800,
  height = 600,
}) => {
  // Calculate view box and layout data
  const viewBoxData = useViewBoxCalculation(layout, width, height);
  const { scale, viewBox, layoutBounds } = viewBoxData;

  // Calculate distribution scores
  const scores = useMemo(() => {
    if (!layout.length || !products.length) return null;

    const centers = layout.map((rect) => calculate2DCenter(rect));
    const weights = products.map((p) => p.weight ?? 1);

    // Calculate aspect ratios
    const aspectRatios = layout.map((rect) => rect.width / rect.length);
    const avgAspectRatio =
      aspectRatios.reduce((a, b) => a + b, 0) / aspectRatios.length;
    const aspectRatioVariance =
      aspectRatios.reduce(
        (sum, ratio) => sum + Math.pow(ratio - avgAspectRatio, 2),
        0,
      ) / aspectRatios.length;
    const aspectRatioScore = 100 - Math.min(100, aspectRatioVariance * 350);

    // Calculate areas
    const areas = layout.map((rect) => rect.width * rect.length);
    const avgArea = areas.reduce((a, b) => a + b, 0) / areas.length;
    const areaVariance =
      areas.reduce((sum, area) => sum + Math.pow(area - avgArea, 2), 0) /
      (avgArea * avgArea * areas.length);
    const areaScore = 100 - Math.min(100, areaVariance * 350);

    // Calculate linear penalty
    const xCoords = centers.map((p) => p.x);
    const yCoords = centers.map((p) => p.y);
    const xRange = Math.max(...xCoords) - Math.min(...xCoords);
    const yRange = Math.max(...yCoords) - Math.min(...yCoords);
    const maxRange = Math.max(xRange, yRange);
    const linearPenalty =
      maxRange === 0 ? 0 : (Math.abs(xRange - yRange) / maxRange) * 150;

    return {
      total: calculateDistributionScore(layout, products),
      aspectRatio: aspectRatioScore,
      area: areaScore,
      linearPenalty,
      centers,
      weights,
    };
  }, [layout, products]);

  if (!scores) return null;

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return COLORS.success.main;
    if (score >= 70) return COLORS.warning.main;
    return COLORS.error.main;
  };

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      {
        label: "产品中心点",
        color: COLORS.neutral.text.primary,
      },
      {
        label: "线性布局惩罚",
        color: COLORS.error.main,
      },
    ],
  };

  // Annotation configuration
  const annotationConfig: AnnotationConfig = {
    title: "分布平衡分析",
    descriptions: [
      "颜色深浅表示宽高比和面积偏差",
      "圆点表示产品中心位置",
      scores.linearPenalty > 0 ? "虚线表示线性布局惩罚" : "",
    ].filter(Boolean),
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* 详细信息面板 */}
      <div className="mb-4 space-y-4 rounded bg-white/90 p-4 text-sm shadow-sm">
        {/* 总分 */}
        <div className="border-b pb-2">
          <div className="font-medium">分布总分</div>
          <div className="text-2xl font-semibold text-slate-800">
            {scores.total.overall.toFixed(1)}
          </div>
        </div>

        {/* 物理特性 */}
        <div className="space-y-2">
          <div className="font-medium">物理特性</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">各向同性比</div>
              <div>{scores.total.details.isotropy.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-gray-600">质心偏移</div>
              <div>{scores.total.details.centerDeviation.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-gray-600">陀螺半径</div>
              <div>{scores.total.details.gyrationRadius.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-gray-600">主惯性矩</div>
              <div>
                {scores.total.details.principalMoments
                  .map((m) => m.toFixed(1))
                  .join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* 体积平衡 */}
        <div className="space-y-2">
          <div className="font-medium">体积平衡</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">密度方差</div>
              <div>
                {scores.total.details.volumeBalance.densityVariance.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">高度分布</div>
              <div>
                {scores.total.details.volumeBalance.heightBalance.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">质量分布</div>
              <div>
                {scores.total.details.volumeBalance.massDistribution.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">对称性</div>
              <div>
                {scores.total.details.volumeBalance.symmetry.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-2 text-xs text-gray-500">
          颜色深浅表示分布评分的高低
        </div>
      </div>

      {/* 主视图 */}
      <div className="relative flex-1">
        <svg
          width={width}
          height={height}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="border border-slate-300"
        >
          {/* Draw layout rectangles with heat map coloring */}
          {layout.map((rect, index) => {
            const aspectRatioDeviation = Math.abs(rect.width / rect.length - 1);
            const areaDeviation = Math.abs(
              (rect.width * rect.length) /
                (layout.reduce((sum, r) => sum + r.width * r.length, 0) /
                  layout.length) -
                1,
            );
            const opacity = Math.min(
              0.8,
              Math.max(0.2, (aspectRatioDeviation + areaDeviation) / 2),
            );

            return (
              <rect
                key={index}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.length}
                fill={getScoreColor(scores.total.overall)}
                fillOpacity={opacity}
                stroke={COLORS.neutral.border}
                strokeWidth={1 / scale}
              />
            );
          })}

          {/* Draw center points */}
          {scores.centers.map((center, index) => (
            <circle
              key={index}
              cx={center.x}
              cy={center.y}
              r={3 / scale}
              fill={COLORS.neutral.text.primary}
              fillOpacity={0.8}
            />
          ))}

          {/* Draw linear distribution indicator */}
          {scores.linearPenalty > 0 && (
            <line
              x1={layoutBounds.minX}
              y1={layoutBounds.minY}
              x2={layoutBounds.maxX}
              y2={layoutBounds.maxY}
              stroke={COLORS.error.main}
              strokeWidth={2 / scale}
              strokeOpacity={Math.min(1, scores.linearPenalty / 100)}
              strokeDasharray={`${10 / scale},${5 / scale}`}
            />
          )}
        </svg>
        <div className="absolute inset-0">
          <Legend config={legendConfig} />
          <Annotation config={annotationConfig} position="bottom-right" />
        </div>
      </div>
    </div>
  );
};
