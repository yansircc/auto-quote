# 通用优化器框架

这是一个用于创建各种优化器的通用框架。它提供了一个统一的接口来定义和实现基于遗传算法的优化器。

## 主要组件

### 核心组件
- `optimizer.ts`: 优化器核心逻辑，实现通用的优化和评分机制

### 类型定义
- `types/core.ts`: 核心类型定义（评分、范围等）
- `types/optimizer.ts`: 优化器相关类型定义

### 配置和工具
- `core/config.ts`: 默认配置常量
- `core/config-factory.ts`: 配置创建工具函数
- `core/test-factory.ts`: 测试用例创建工具函数
- `core/score-evaluation.ts`: 分数评估工具
- `utils/score-reporter.ts`: 评分报告生成器
- `utils/config-generator.ts`: 优化配置生成器

## 主要特性

- 统一的测试用例格式
- 通用的评分机制
- 可配置的优化参数
- 基于遗传算法的优化过程
- 详细的评分反馈
- 自动生成优化后的配置文件
- 类型安全的参数转换
- 内置默认配置和工具函数

## 使用方法

### 1. 定义类型

```typescript
// 输入类型
interface YourInputType {
  // 你的输入参数
}

// 配置类型
interface YourConfigType {
  // 你的配置结构
}

// 扁平参数类型（用于遗传算法）
type YourFlatParams = Record<string, number>;
```

### 2. 定义参数范围

```typescript
import type { ParamRange } from '@/lib/algorithms/optimizer';

// 参数优化范围配置
const PARAM_RANGES: Record<string, ParamRange> = {
  param1: { min: 0, max: 100 },
  param2: { min: 0, max: 100, step: 0.1 }, // step 是可选的
};
```

### 3. 定义测试用例

```typescript
import { createTestCases } from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

// 创建测试用例集
const TEST_CASES = createTestCases<YourInputType, YourConfigType>([
  // 使用分数范围
  {
    input: {
      // 你的输入参数
    },
    minScore: 90, // 最小可接受分数
    maxScore: 100, // 最大可接受分数
    description: "理想情况测试",
  },
  
  // 或使用精确分数
  {
    input: {
      // 你的输入参数
    },
    exactScore: 85, // 期望的精确分数
    description: "精确分数测试",
  },
]);
```

### 4. 创建优化器配置

```typescript
import {
  createGeneticConfig,
  createScoringConfig,
  type OptimizerConfig,
} from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

// 创建优化器配置
const optimizerConfig: OptimizerConfig<YourInputType, YourConfigType, YourFlatParams> = {
  // 计算具体分数的函数
  calculateScore: (input: YourInputType, config: YourConfigType) => ({
    total: 0,
    // 可以添加其他指标
    otherMetrics: 0,
  }),
  
  // 参数转换函数
  flatParamsToConfig: (params: YourFlatParams) => {
    // 将扁平参数转换为配置对象
    return {} as YourConfigType;
  },
  
  // 遗传算法配置
  geneticConfig: createGeneticConfig(
    PARAM_RANGES,
    [], // 有序参数组（可选）
    (params) => 0, // 适应度函数
  ),
  
  // 优化器评分配置（可选）
  optimizerConfig: createScoringConfig({
    baseFitness: 800,
    maxBonus: 300,
  }),
  
  // 评估测试分数的函数
  evaluateTestScore: (params: YourFlatParams, verbose = false) => 0,
  
  // 测试用例
  testCases: TEST_CASES,
};
```

### 5. 创建和使用优化器

```typescript
import { createOptimizer, generateOptimizedConfig } from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

// 创建优化器实例
const optimizer = createOptimizer(optimizerConfig);

// 评估默认配置
const defaultScore = optimizer.evaluateTestScore(defaultParams, true);

// 查找最佳配置
const { config: bestConfig, score: bestScore } = await optimizer.findBestConfig();

// 如果有改进，生成配置文件
const improvement = bestScore - defaultScore;
if (improvement > 0) {
  generateOptimizedConfig({
    name: "某某",
    configTypeName: "SomeConfig",
    config: bestConfig,
    improvement,
    outputPath: "./optimized.ts"
  });
}
```

### 6. 使用评分工具

```typescript
import { ScoreEvaluation } from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

// 计算适应度分数
const fitnessScore = ScoreEvaluation.calculateFitnessScore(
  actualScore,
  { min: 8, max: 12 },
  { baseFitness: 100, bonus: 0.2, penalty: 0.5 }
);

// 评估分数变化
const quality = ScoreEvaluation.evaluateScoreChange(
  previousScore,
  currentScore,
  { min: 8, max: 12 }
);

// 计算百分比变化
const change = ScoreEvaluation.calculatePercentageChange(
  previousScore,
  currentScore
);
```

## 配置说明

### 遗传算法配置

```typescript
import { DEFAULT_GENETIC_CONFIG } from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

const geneticConfig = {
  ...DEFAULT_GENETIC_CONFIG,
  populationSize: 200,      // 种群大小
  maxGenerations: 1000,     // 最大迭代次数
  mutationRate: 0.1,        // 变异率
  eliteRatio: 0.1,          // 精英比例
  convergenceThreshold: 0.001, // 收敛阈值
};
```

### 评分配置

```typescript
import { DEFAULT_OPTIMIZER_CONFIG } from '@/lib/quote-price/mold/layout/balance/generic-optimizer';

const scoringConfig = {
  ...DEFAULT_OPTIMIZER_CONFIG,
  baseFitness: 100,       // 基础分数
  maxBonus: 20,          // 最大奖励分数
  penaltyFactor: 2,      // 惩罚因子
  maxAllowedDiff: 0.01,  // 最大允许误差
};
