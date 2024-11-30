import type { Rectangle, Product } from '@/types/geometry';
import { calculateWeightedVariance } from '../../utils/math';

/**
 * Calculate volume utilization score
 * Considers both overall utilization and balance
 * 计算体积利用分数，考虑整体利用率和平衡性
 */
export function calculateVolumeScore(
  layout: Rectangle[],
  products: Product[]
): number {
  if (!layout.length || !products.length) return 0;

  // Calculate areas and densities
  const areas = layout.map(rect => rect.width * rect.height);
  const totalArea = areas.reduce((sum, area) => sum + area, 0);

  if (totalArea === 0) return 0;

  // Calculate volume density (volume per unit area)
  const volumes = products.map(p => p.cadData?.volume ?? 0);
  const densities = volumes.map((vol, i) => vol / areas[i]!);
  const weights = areas.map(area => area / totalArea);

  // Calculate weighted variance of densities
  const variance = calculateWeightedVariance(densities, weights);

  // Normalize variance and convert to score
  const maxDensity = Math.max(...densities);
  if (maxDensity === 0) return 0;

  const normalizedVariance = variance / (maxDensity * maxDensity);
  return Math.max(0, Math.min(100, 100 * (1 - normalizedVariance)));
}
