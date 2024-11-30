import React, { useMemo } from 'react';
import { 
  type BaseVisualizerProps, 
  useViewBoxCalculation, 
  Legend, 
  type LegendConfig,
  Annotation,
  type AnnotationConfig,
} from './base/BaseScoreVisualizer';
import { calculateVolumeScore } from '@/lib/algorithm/balance/score';
import { COLORS } from '@/lib/constants/colors';

export const VolumeScoreVisualizer: React.FC<BaseVisualizerProps> = ({
  layout,
  products,
  width = 800,
  height = 600,
}) => {
  // Calculate view box and layout data
  const viewBoxData = useViewBoxCalculation(layout, width, height);
  const { scale, viewBox } = viewBoxData;

  // Calculate volume utilization scores
  const scores = useMemo(() => {
    if (!layout.length || !products.length) return null;

    // Calculate areas and volumes
    const areas = layout.map(rect => rect.width * rect.height);
    const volumes = products.map((p, i) => {
      const defaultVolume = areas[i] ?? 0;
      return p.cadData?.volume ?? defaultVolume;
    });

    // Ensure we have valid data
    if (areas.some(area => area <= 0) || volumes.some(vol => vol <= 0)) {
      return null;
    }

    const totalArea = areas.reduce((acc, curr) => acc + curr, 0);
    const totalVolume = volumes.reduce((acc, curr) => acc + curr, 0);

    // Calculate utilization ratio
    const utilizationRatio = totalVolume / totalArea;
    const utilizationScore = Math.min(100, utilizationRatio * 100);

    // Calculate balance
    const avgVolume = totalVolume / volumes.length;
    const volumeVariance = volumes.reduce((acc, curr) => 
      acc + Math.pow(curr - avgVolume, 2), 0) / (avgVolume * avgVolume * volumes.length);
    const balanceScore = 100 - Math.min(100, volumeVariance * 350);

    return {
      total: calculateVolumeScore(layout, products),
      utilization: utilizationScore,
      balance: balanceScore,
      volumes: volumes,
      areas: areas,
    };
  }, [layout, products]);

  if (!scores) return null;

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return COLORS.success.main;      // 更合理的成功阈值
    if (score >= 55) return COLORS.warning.main;      // 更合理的警告阈值
    return COLORS.error.main;
  };

  // Legend configuration
  const legendConfig: LegendConfig = {
    items: [
      {
        label: '高体积利用率 (≥85%)',
        color: COLORS.success.main,
      },
      {
        label: '中等体积利用率 (65-85%)',
        color: COLORS.warning.main,
      },
      {
        label: '低体积利用率 (<65%)',
        color: COLORS.error.main,
      },
    ],
  };

  // Annotation configuration
  const annotationConfig: AnnotationConfig = {
    title: '体积利用分析',
    descriptions: [
      '颜色深浅表示体积利用率',
      '方块大小表示相对体积',
    ],
  };

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="absolute inset-0"
      >
        {/* Draw layout rectangles with volume utilization coloring */}
        {layout.map((rect, index) => {
          const volume = scores.volumes[index] ?? 0;
          const area = scores.areas[index] ?? 0;
          const utilizationRatio = area > 0 ? volume / area : 0;
          
          // 将利用率映射到0.3-0.8的透明度范围
          const minOpacity = 0.3;
          const maxOpacity = 0.8;
          const opacity = minOpacity + (maxOpacity - minOpacity) * Math.min(1, utilizationRatio);
          
          return (
            <rect
              key={index}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={getScoreColor(scores.total)}
              fillOpacity={opacity}
              stroke={getScoreColor(scores.total)}
              strokeWidth={1 / scale}
            />
          );
        })}

        {/* Draw volume indicators */}
        {layout.map((rect, index) => {
          const volume = scores.volumes[index] ?? 0;
          const maxVolume = Math.max(0, ...scores.volumes);
          const radius = maxVolume > 0 ? (3 + (volume / maxVolume) * 5) / scale : 3 / scale;
          const center = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };
          
          return (
            <circle
              key={`volume-${index}`}
              cx={center.x}
              cy={center.y}
              r={radius}
              fill={COLORS.neutral.text.primary}
              fillOpacity={0.8}
            />
          );
        })}
      </svg>

      <Legend config={legendConfig} />
      <Annotation config={annotationConfig} position="bottom-right" />
    </div>
  );
};
