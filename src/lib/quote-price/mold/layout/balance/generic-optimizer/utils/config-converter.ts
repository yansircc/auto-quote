import type { Range } from "../types/core";

/**
 * 参数转换工具类
 */
export class ParamConverter {
  /**
   * 将标准化的参数值（0-1）转换为实际范围内的值
   */
  static denormalize(value: number, range: Range): number {
    return range.min + value * (range.max - range.min);
  }

  /**
   * 将实际范围内的值标准化为0-1
   */
  static normalize(value: number, range: Range): number {
    return (value - range.min) / (range.max - range.min);
  }

  /**
   * 将对象的所有数值属性标准化为0-1
   */
  static normalizeParams<T extends Record<Extract<keyof T, string>, number>>(
    params: T,
    ranges: Record<keyof T, Range>,
  ): T {
    const result = { ...params };
    for (const key in params) {
      if (ranges[key]) {
        result[key] = this.normalize(params[key], ranges[key]) as T[Extract<
          keyof T,
          string
        >];
      }
    }
    return result;
  }

  /**
   * 将标准化的参数值（0-1）转换回实际范围
   */
  static denormalizeParams<T extends Record<Extract<keyof T, string>, number>>(
    params: T,
    ranges: Record<keyof T, Range>,
  ): T {
    const result = { ...params };
    for (const key in params) {
      if (ranges[key]) {
        result[key] = this.denormalize(params[key], ranges[key]) as T[Extract<
          keyof T,
          string
        >];
      }
    }
    return result;
  }

  /**
   * 确保参数在指定范围内
   */
  static clampParams<T extends Record<Extract<keyof T, string>, number>>(
    params: T,
    ranges: Record<keyof T, Range>,
  ): T {
    const result = { ...params };
    for (const key in params) {
      if (ranges[key]) {
        const { min, max } = ranges[key];
        result[key] = Math.max(min, Math.min(max, params[key])) as T[Extract<
          keyof T,
          string
        >];
      }
    }
    return result;
  }

  /**
   * 线性插值
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * 反向线性插值
   */
  static inverseLerp(start: number, end: number, value: number): number {
    return (value - start) / (end - start);
  }

  /**
   * 重映射值从一个范围到另一个范围
   */
  static remap(value: number, fromRange: Range, toRange: Range): number {
    const t = this.inverseLerp(fromRange.min, fromRange.max, value);
    return this.lerp(toRange.min, toRange.max, t);
  }
}
