# Distance Optimizer

距离优化器模块，用于优化模具布局中的偏离度和极差比指标。

## 目录结构

```
distance-new/
├── core/               # 核心定义
│   ├── config.ts      # 配置参数和约束
│   └── types.ts       # 核心类型定义
├── scoring/           # 评分相关
│   ├── calculator.ts  # 评分计算逻辑
│   ├── evaluator.ts   # 评分评估器
│   └── test-cases.ts  # 测试用例
├── utils/            # 工具函数
│   ├── param-converter.ts  # 参数转换器
│   └── score-reporter.ts   # 评分报告生成器
├── runner.ts           # 运行入口
├── index.ts         # 公共导出
└── optimizer.ts     # 优化器实现
```

## 主要功能

1. **评分计算**
   - 计算偏离度（CV）得分
   - 计算极差比（Range）得分
   - 计算组合奖励和惩罚

2. **参数优化**
   - 基于遗传算法的参数优化
   - 支持多次迭代优化，自动选择最佳结果
   - 支持多个测试用例
   - 支持参数约束和优先级

3. **评分报告**
   - 详细的测试用例得分对比
   - 可视化的进度展示
   - 彩色输出优化结果
   - 自动计算改进百分比

## 使用方法

```typescript
import { findBestConfig } from './index';
import { getConfigScores, getDefaultParamsFromRanges } from './scoring/evaluator';
import { ScoreReporter } from './utils/score-reporter';
import type { OptimizeResult } from './core/types';

// 创建报告生成器
const reporter = new ScoreReporter();

// 运行优化器（支持多次迭代）
const { params: bestParams, scores: bestScores } = reporter.runWithProgress<OptimizeResult>({
  total: 10, // 迭代次数
  onProgress: () => {
    const params = findBestConfig();
    return {
      params,
      scores: getConfigScores(params)
    };
  },
  getBestScore: (result) => result.scores.avgScore
});

// 获取基准配置得分
const previousParams = getDefaultParamsFromRanges(PREVIOUS_RANGES);
const previousScores = getConfigScores(previousParams);

// 生成评分报告
reporter.generateReport({ previousScores, bestScores, bestParams });
```

## 评分报告功能

1. **进度提示**
   - 支持自定义进度条格式
   - 实时显示最佳分数
   - 自动处理单次/多次迭代场景

2. **得分对比**
   - 显示每个测试用例的得分变化
   - 计算改进百分比
   - 彩色标记改进和退步
   - 显示期望分数范围

3. **参数展示**
   - 自动显示最佳参数配置
   - 仅在有改进时展示

## 注意事项

1. 确保参数范围在合理区间内
2. 注意参数之间的约束关系
3. 评分权重的合理配置
4. 运行多次迭代以获得更好的结果
5. 查看评分报告以了解具体改进情况

## 依赖项

- `cli-progress`: 进度条显示
- `cli-table3`: 表格输出
- `chalk`: 终端彩色输出
