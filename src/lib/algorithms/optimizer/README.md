# 参数优化器系统

这是一个基于遗传算法的通用参数优化系统，专门用于优化具有复杂约束的多参数配置。

## 目录结构

```
optimizer/
├── core/                # 核心组件
│   ├── types.ts        # 基础类型定义
│   ├── validator.ts    # 参数验证逻辑
│   └── generator.ts    # 参数生成器
│
├── genetic/            # 遗传算法实现
│   ├── types.ts        # 遗传算法相关类型
│   └── optimizer.ts    # 遗传算法优化器
│
└── utils/             # 工具函数
    └── range-utils.ts  # 范围处理工具
```

## 主要功能

1. **参数范围定义**
   - 支持相对范围和绝对范围
   - 可设置最小值、最大值和步长
   - 支持百分比变化范围

2. **约束处理**
   - 参数顺序约束（如 A < B < C）
   - 参数和约束（如 A + B = 1）
   - 自定义验证规则

3. **遗传算法优化**
   - 自适应种群大小
   - 精英保留策略
   - 自动收敛检测
   - 可自定义适应度函数

## 使用方法

### 1. 定义参数配置

```typescript
import type { OptimizerConfig } from "@/lib/algorithms/optimizer";

// 定义参数范围
const ranges = {
  paramA: { min: 0, max: 1, step: 0.1 },
  paramB: { min: 0, max: 1, step: 0.1 },
};

// 定义顺序约束
const orderedGroups = [
  {
    name: "group1",
    params: ["paramA", "paramB"],
  },
];

// 定义和约束
const sumConstraints = [
  {
    targetSum: 1,
    params: ["paramA", "paramB"],
    tolerance: 0.001,
  },
];

// 创建优化器配置
const config: OptimizerConfig<YourParamType> = {
  ranges,
  orderedGroups,
  sumConstraints,
};
```

### 2. 配置遗传算法

```typescript
import { GeneticConfig } from "@/lib/algorithms/optimizer";

const geneticConfig: GeneticConfig<YourParamType> = {
  populationSize: 100,      // 种群大小
  maxGenerations: 500,      // 最大代数
  mutationRate: 0.1,        // 变异率
  eliteRatio: 0.1,         // 精英比例
  convergenceThreshold: 1e-6, // 收敛阈值
  parameterConfig: config,  // 参数配置
  fitnessFunction: (params) => {
    // 实现你的适应度评估函数
    return score;
  },
};
```

### 3. 运行优化

```typescript
import { GeneticOptimizer } from "@/lib/algorithms/optimizer";

const optimizer = new GeneticOptimizer(geneticConfig);
const result = optimizer.optimize();

console.log("最佳参数:", result.bestParams);
console.log("最佳适应度:", result.bestFitness);
console.log("收敛代数:", result.convergenceGeneration);
```

## 实际应用示例

查看 `/src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/position-optimizer` 目录下的代码，了解如何使用这个优化器系统来优化模具设计中的位置参数。

## 注意事项

1. **参数范围设置**
   - 确保范围合理，避免过大或过小
   - 考虑参数的物理意义
   - 适当设置步长以减少搜索空间

2. **约束定义**
   - 约束不要过于严格，留有适当余地
   - 注意约束之间的相互影响
   - 验证约束的可行性

3. **遗传算法配置**
   - 种群大小影响搜索效果和性能
   - 变异率影响局部搜索能力
   - 精英比例影响收敛速度
   - 收敛阈值影响优化精度

4. **性能考虑**
   - 适应度函数应尽可能高效
   - 避免过多的约束检查
   - 合理设置终止条件

## 扩展开发

1. **添加新的参数类型**
   - 在 `core/types.ts` 中定义新的参数类型
   - 在 `core/validator.ts` 中添加相应的验证逻辑
   - 在 `core/generator.ts` 中实现参数生成逻辑

2. **自定义优化算法**
   - 参考 `genetic/optimizer.ts` 的实现
   - 继承或实现相同的接口
   - 确保处理所有约束条件

3. **添加新的约束类型**
   - 在 `core/types.ts` 中定义约束接口
   - 在 `core/validator.ts` 中实现验证逻辑
   - 在 `core/generator.ts` 中处理约束

## 常见问题

1. **优化结果不理想？**
   - 检查参数范围是否合理
   - 调整遗传算法参数
   - 验证适应度函数的正确性
   - 考虑增加约束条件

2. **优化过程过慢？**
   - 减小参数范围或增加步长
   - 调整种群大小
   - 优化适应度函数性能
   - 考虑使用并行计算

3. **无法收敛？**
   - 检查约束是否存在冲突
   - 调整收敛阈值
   - 增加最大代数
   - 考虑问题的可行性

## 后续计划

1. **功能增强**
   - 支持更多类型的约束
   - 添加参数敏感性分析
   - 实现多目标优化
   - 支持并行计算

2. **使用体验**
   - 提供可视化工具
   - 改进错误提示
   - 添加更多示例
   - 完善文档说明

3. **性能优化**
   - 实现缓存机制
   - 优化内存使用
   - 支持增量优化
   - 添加提前终止策略
