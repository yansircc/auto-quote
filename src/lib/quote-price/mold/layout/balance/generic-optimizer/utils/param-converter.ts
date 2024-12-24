import type { FlatParams, Range } from "../types/core";

/**
 * 递归对象类型
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

/**
 * 参数映射配置
 */
export interface ParamMapping {
  /** 参数在配置对象中的路径 */
  path: string[];
  /** 参数在扁平对象中的名称 */
  paramName: string;
}

/**
 * 从参数范围获取默认参数（使用中间值）
 */
export function getDefaultParams(
  ranges: Record<string, Range>,
): Record<string, number> {
  const params: Record<string, number> = {};

  for (const [key, range] of Object.entries(ranges)) {
    params[key] = (range.min + range.max) / 2;
  }

  return params;
}

/**
 * 创建参数转换器
 */
export function createParamConverter<
  TConfig extends object,
  TParams extends FlatParams,
>(mappings: ParamMapping[]) {
  /**
   * 将扁平参数转换为配置对象
   */
  function paramsToConfig(params: TParams): TConfig {
    // 创建一个中间对象来构建配置
    const buildConfig = (
      current: RecursivePartial<TConfig>,
      path: string[],
      value: number,
    ): void => {
      const [first, ...rest] = path;

      // 如果 first 为空，说明路径已不合逻辑，直接返回
      if (!first) return;

      // 如果没有下一级路径，则直接赋值
      if (rest.length === 0) {
        (current as Record<string, number | RecursivePartial<TConfig>>)[first] =
          value;
      } else {
        // 如果 current[first] 尚未被创建，先初始化为一个空对象
        if (!(first in current)) {
          (current as Record<string, RecursivePartial<TConfig>>)[first] = {};
        }
        // 递归创建 / 赋值
        const nextLevel = (
          current as Record<string, RecursivePartial<TConfig>>
        )[first];
        if (nextLevel && typeof nextLevel === "object") {
          buildConfig(nextLevel, rest, value);
        }
      }
    };

    // 使用中间对象构建配置
    const result = {} as RecursivePartial<TConfig>;

    for (const { path, paramName } of mappings) {
      // 从扁平参数中获取值，可能为 number 或 undefined
      const paramValue = params[paramName];

      // 如果取不到值，可以根据需求选择：
      // 1. 跳过不设置  2. 设置默认值  3. 抛错
      // 这里采取"跳过"策略
      if (typeof paramValue !== "number") {
        continue;
        // 或者：buildConfig(result, path, 0) 为默认值
      }

      buildConfig(result, path, paramValue);
    }

    // 类型断言为 TConfig 是安全的，因为我们按照 TConfig 的结构构建了对象
    return result as TConfig;
  }

  return { paramsToConfig };
}
