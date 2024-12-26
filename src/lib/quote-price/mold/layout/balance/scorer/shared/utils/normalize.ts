import type { ParamPrefix } from "@/lib/quote-price/mold/layout/balance/optimizer";
import type { FlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 指标配置接口
 */
export interface MetricConfig {
  prefix: ParamPrefix;
  inverse?: boolean;
}

/**
 * 归一化函数类型
 */
export type NormalizerFn = (value: number, params: FlatParams) => number;

/**
 * 通用的归一化函数
 */
export function normalizeMetric(
  value: number,
  params: FlatParams,
  config: MetricConfig,
): number {
  const { prefix, inverse = false } = config;

  // 从参数中获取阈值
  const thresholds = {
    perfect: params[`${prefix}_PERFECT`],
    good: params[`${prefix}_GOOD`],
    medium: params[`${prefix}_MEDIUM`],
    bad: params[`${prefix}_BAD`],
  };

  // 确定范围
  const minValue = thresholds.perfect;
  const maxValue = thresholds.bad;

  if (minValue === undefined || maxValue === undefined) {
    throw new Error("Invalid thresholds");
  }

  // 限制在范围内
  let normalized = Math.max(minValue, Math.min(maxValue, value));

  // 如果是反向指标（越小越好）
  if (inverse) {
    normalized = maxValue - (normalized - minValue);
  }

  return normalized;
}

/**
 * 创建特定指标的归一化函数
 */
export function createNormalizer(config: MetricConfig): NormalizerFn {
  return (value: number, params: FlatParams) =>
    normalizeMetric(value, params, config);
}
