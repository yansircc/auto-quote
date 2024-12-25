# 流动平衡优化系统

## 系统概述

本系统是一个专门用于评估和优化注塑模具中流道系统平衡性的解决方案。通过多维度评分机制和智能优化算法，确保模具中的流道布局达到最佳平衡状态，从而提高注塑成型的质量和一致性。

## 评分维度

系统从以下三个关键维度进行评分：

1. **重心距离分布 (33%)**
   - 评估所有流道末端到注塑点的距离分布
   - 使用变异系数（CV）和极差比评估分布均匀性
   - 采用平滑分段函数进行评分映射
   - 通过遗传算法优化的阈值配置

2. **重心位置评分 (33%)**
   - 评估流道系统的整体重心位置
   - 计算与理想注塑点的偏离程度
   - 考虑相对高度和布局尺寸
   - 优化后的偏差容忍度配置

3. **力矩平衡性评分 (34%)**
   - 评估开模时的力矩平衡情况
   - 计算三个方向的力矩分布
   - 使用RSD（相对标准差）评估平衡性
   - 基于物理模拟的评分标准

## 智能优化系统

### 遗传算法优化器

系统的一大亮点是采用了基于遗传算法的智能优化器（`magic-numbers/optimizer`），具有以下特点：

1. **多目标优化**
   - 同时优化距离、位置和力矩三个维度
   - 使用帕累托最优解处理目标冲突
   - 支持权重动态调整

2. **适应度函数设计**
   - 基础适应度分数：1000分
   - 最大奖励分数：200分
   - 惩罚系数：每1分偏差扣75分
   - 允许1分的误差容忍度
   - 采用惩罚函数处理不可行解

3. **参数优化范围**
   - CV阈值范围：
     - 完美: 0.04-0.06
     - 良好: 0.18-0.22
     - 中等: 0.40-0.50
     - 较差: 0.70-0.80
   - 极差比阈值范围：
     - 完美: 0.13-0.17
     - 良好: 0.32-0.38
     - 中等: 0.60-0.70
     - 较差: 0.80-0.90
   - 分数区间配置：
     - 完美基准: 90-95分
     - 良好基准: 82-88分
     - 中等基准: 70-80分
     - 较差基准: 55-65分

## 测试体系

### 全面的测试用例（`magic-numbers/__test__`）

系统包含了一套精心设计的测试用例。每个测试用例包含：
- 输入：距离数组、布局尺寸
- 期望：精确分数或分数区间
- 测试标签：用于分类和追踪
- 测试描述：说明测试目的

## 目录结构

```markdown
src/lib/quote-price/mold/layout/balance/flow
├── README.md                 # 系统说明文档
├── __test__                 # 流动平衡系统测试
│   ├── flow.test.ts         # 主要测试用例
│   ├── test-cases.ts        # 测试数据
│   └── test-utils.ts        # 测试工具函数
├── index.ts                 # 系统入口文件
├── rating                   # 评分系统
│   ├── index.ts             # 评分系统入口
│   ├── magic-numbers        # 评分参数配置
│   │   ├── __test__         # 参数测试
│   │   │   ├── configs      # 测试配置
│   │   │   ├── test-cases   # 参数测试用例
│   │   │   ├── test-utils   # 测试工具
│   │   │   └── types.ts     # 测试类型定义
│   │   ├── optimizer        # 参数优化器
│   │   │   ├── distance-optimizer  # 距离评分优化
│   │   │   ├── momentum-optimizer  # 力矩评分优化
│   │   │   └── position-optimizer  # 位置评分优化
│   │   └── options          # 优化参数配置
│   │       ├── distance     # 距离评分参数
│   │       ├── index.ts     # 参数导出
│   │       ├── momentum     # 力矩评分参数
│   │       └── position     # 位置评分参数
│   ├── metrics              # 评分计算模块
│   │   ├── distance.ts      # 距离评分计算
│   │   ├── index.ts         # 评分计算入口
│   │   ├── momentum.ts      # 力矩评分计算
│   │   ├── position.ts      # 位置评分计算
│   │   └── utils.ts         # 评分工具函数
│   └── physics              # 物理计算模块
│       ├── index.ts         # 物理计算入口
│       ├── mechanics.ts     # 力学计算
│       ├── statistics.ts    # 统计计算
│       └── types.ts         # 物理类型定义
└── types                    # 类型定义
    ├── analysis.ts          # 分析结果类型
    ├── base.ts             # 基础类型
    ├── config.ts           # 配置类型
    ├── index.ts            # 类型导出
    ├── physics.ts          # 物理相关类型
    └── scores.ts           # 评分相关类型
```

## 使用指南

### 优化器使用

系统提供了三个独立的优化器，分别用于优化距离、位置和力矩评分的参数配置：

1. **距离评分优化**
   ```bash
   # 运行距离评分优化器
   cd src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/optimizer/distance-optimizer
   ts-node run.ts
   ```
   优化器会：
   - 显示当前默认配置及其评分
   - 运行遗传算法寻找最优配置
   - 输出最佳配置及评分提升
   - 自动生成 `optimized.ts` 配置文件

2. **位置评分优化**
   ```bash
   cd src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/optimizer/position-optimizer
   ts-node run.ts
   ```
   生成的配置文件位于 `options/position/optimized.ts`

3. **力矩评分优化**
   ```bash
   cd src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/optimizer/momentum-optimizer
   ts-node run.ts
   ```
   生成的配置文件位于 `options/momentum/optimized.ts`

### 使用优化后的配置

在各自的 `options/*/index.ts` 中切换配置：

```typescript
// 使用优化后的距离评分配置
// options/distance/index.ts
export { OPTIMIZED_DISTANCE as DISTANCE } from "./optimized";
// export { DEFAULT_DISTANCE as DISTANCE } from "./default";

// 使用优化后的位置评分配置
// options/position/index.ts
export { OPTIMIZED_POSITION as POSITION } from "./optimized";
// export { DEFAULT_POSITION as POSITION } from "./default";

// 使用优化后的力矩评分配置
// options/momentum/index.ts
export { OPTIMIZED_MOMENTUM as MOMENTUM } from "./optimized";
// export { DEFAULT_MOMENTUM as MOMENTUM } from "./default";
```

### 评分计算

```typescript
import { calculateFlowBalance } from "./rating";

const score = calculateFlowBalance(cuboids);
console.log(score.breakdown);  // 查看各维度得分
```

## 性能优化

1. **计算优化**
   - 缓存物理属性计算结果
   - 使用向量化运算
   - 优化循环和递归结构

2. **并行计算**
   - Web Worker支持
   - 遗传算法并行评估
   - 异步评分计算