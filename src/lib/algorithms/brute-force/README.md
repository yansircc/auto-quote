# 暴力枚举优化工具

这是一个通用的暴力枚举优化工具，可以用于在给定参数空间内搜索最优解。该工具支持任意维度的参数空间，并提供了丰富的回调机制和安全检查。

## 特性

- 🔍 支持任意维度的参数空间搜索
- 🛡️ 完整的类型安全支持
- 📊 实时进度监控和统计
- ⚡ 性能和内存使用优化
- 🚫 自动防止过大搜索空间
- 🎯 灵活的终止条件
- 🔄 丰富的事件回调

## 安装

```bash
npm install @your-org/brute-force-optimizer
```

## 快速开始

这是一个简单的示例，展示如何使用暴力枚举找到函数 f(x,y) = -(x² + y²) 的最大值：

```typescript
import { bruteForceSearch } from './index';
import type { BruteForceConfig, Point2DParameterSpace } from './types';

// 定义搜索空间
const parameterSpace: Point2DParameterSpace = {
  x: { min: -10, max: 10, step: 0.5 },
  y: { min: -10, max: 10, step: 0.5 },
};

// 配置搜索参数
const config: BruteForceConfig<Point2D> = {
  parameterSpace,
  evaluateConfig: (p: Point2D) => -(p.x * p.x + p.y * p.y),
  validateConfig: (p: Point2D) => p.x * p.x + p.y * p.y <= 100,
  callbacks: {
    onProgress: (progress) => {
      console.log(`搜索进度: ${(progress.progress * 100).toFixed(1)}%`);
    },
  },
};

// 执行搜索
const result = await bruteForceSearch(config);
console.log('最优解:', result.bestConfig);
console.log('最优值:', result.bestScore);
```

## API 文档

### 配置选项

#### BruteForceConfig<T>

主要配置接口，泛型参数 `T` 表示配置的类型：

```typescript
interface BruteForceConfig<T> {
  // 参数空间定义
  parameterSpace: ParameterSpace;
  
  // 评估函数：计算当前配置的得分
  evaluateConfig: (config: T) => number | Promise<number>;
  
  // 可选：验证函数，用于过滤无效配置
  validateConfig?: (config: T) => boolean;
  
  // 可选：终止条件
  terminationCondition?: {
    maxTime?: number;        // 最大运行时间(ms)
    maxEvaluations?: number; // 最大评估次数
    minScore?: number;       // 最小得分要求
  };
  
  // 可选：回调函数
  callbacks?: BruteForceCallbacks<T>;
}
```

#### ParameterSpace

参数空间定义：

```typescript
interface ParameterRange {
  min: number;    // 最小值
  max: number;    // 最大值
  step: number;   // 步长
}

type ParameterSpace = {
  [key: string]: ParameterRange | ParameterSpace;
};
```

### 回调函数

提供了多种回调函数用于监控搜索进度：

```typescript
interface BruteForceCallbacks<T> {
  // 评估回调：每次评估配置后触发
  onEvaluation?: (event: BruteForceEvent<T>) => void;
  
  // 新最优解回调
  onNewBest?: (config: T, score: number) => void;
  
  // 进度回调：定期触发，报告搜索进度
  onProgress?: (progress: BruteForceProgress) => void;
  
  // 完成回调
  onComplete?: (config: T, score: number, stats: SearchStats) => void;
  
  // 错误回调
  onError?: (error: Error, config: T) => void;
}
```

### 返回值

搜索完成后返回的结果：

```typescript
interface BruteForceResult<T> {
  bestConfig: T;           // 最优配置
  bestScore: number;       // 最优得分
  stats: SearchStats;      // 统计信息
  searchSpace: {           // 搜索空间信息
    size: number;         // 搜索空间大小
    dimensions: number;   // 维度数
  };
}
```

## 安全限制

为了防止资源耗尽，工具内置了以下安全限制：

- 最大配置数量：1000万
- 搜索空间计算超时：5秒
- 自动检测整数溢出
- 参数范围有效性检查

## 性能优化建议

1. 合理设置步长：步长越小，搜索空间越大
2. 使用验证函数过滤无效配置
3. 设置合适的终止条件
4. 对于大规模搜索，考虑使用遗传算法等启发式方法

## 示例

更多示例可以在 `example.ts` 文件中找到，包括：

- 基本使用示例
- 进度条显示示例
- 多维参数空间示例
- 自定义验证和终止条件示例

## 许可证

MIT
