import * as fs from "fs";
import * as path from "path";

/**
 * 生成优化后的配置文件
 */
export function generateOptimizedConfig<T>({
  name,
  configTypeName,
  config,
  improvement,
  outputPath,
}: {
  name: string;
  configTypeName: string;
  config: T;
  improvement: number;
  outputPath: string;
}): void {
  const configContent = `import type { ${configTypeName} } from "./types";

/**
 * 优化后的${name}评分参数配置
 * 由优化器自动生成于 ${new Date().toLocaleString()}
 * 相比默认配置提升了 ${improvement.toFixed(2)} 分
 */
export const OPTIMIZED_${configTypeName.toUpperCase()}: ${configTypeName} = ${JSON.stringify(
    config,
    null,
    2,
  )} as const;
`;

  fs.writeFileSync(outputPath, configContent, "utf-8");
  console.log(
    `\n已生成优化后的配置文件: ${path.relative(process.cwd(), outputPath)}`,
  );

  // 生成导入说明
  console.log("\n使用优化后的配置:");
  console.log(
    `import { OPTIMIZED_${configTypeName.toUpperCase()} } from "./optimized";`,
  );
}
