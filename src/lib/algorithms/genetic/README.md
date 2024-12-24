# 通用遗传算法优化工具

这是一个功能强大且灵活的遗传算法框架，可用于各种优化问题。它提供了丰富的配置选项、实时反馈机制和自适应参数调整功能。特别适合连续优化问题和超参数调优。

## 特性

- 🎯 通用性强：支持数值数组和对象类型的优化
- 📊 实时监控：提供详细的进化过程信息
- 🔄 自适应参数：根据种群多样性自动调整
- 🎛 高度可配置：支持自定义各种参数和函数
- 📈 多样性保护：使用对数空间和线性空间的混合距离度量
- 🛡 数值稳定性：特殊处理对数和幂运算，避免 NaN 和溢出

## 快速开始

```typescript
import { geneticOptimize } from './index';
import type { GeneticConfig } from './types';

// 1. 定义你的问题类型
interface MyProblem {
  // ... 你的问题参数
}

// 2. 配置遗传算法
const config: GeneticConfig<MyProblem> = {
  populationSize: 100,        // 种群大小
  maxGenerations: 50,         // 最大迭代次数
  mutationRate: 0.1,          // 变异率
  crossoverRate: 0.8,         // 交叉率
  elitismRate: 0.1,           // 精英保留率
  
  // 定义适应度函数（越大越好）
  fitnessFunction: (individual: MyProblem) => {
    // 处理无效参数
    if (!isValid(individual)) {
      return -Infinity;
    }
    return calculateFitness(individual);
  },
  
  // 定义如何生成个体（确保参数在有效范围内）
  generateIndividual: () => ({
    param1: generateValidParam1(),
    param2: generateValidParam2(),
  }),
  
  // 定义变异操作（保持参数有效性）
  mutate: (individual: MyProblem) => {
    const mutated = { ...individual };
    // 在对数空间进行变异（如果参数是指数级的）
    mutated.param1 = Math.exp(
      Math.log(individual.param1) + randn() * 0.1
    );
    // 在线性空间进行变异（如果参数是线性的）
    mutated.param2 = clamp(
      individual.param2 + randn() * 0.1,
      MIN_PARAM2,
      MAX_PARAM2
    );
    return mutated;
  },
  
  // 定义交叉操作（保持参数有效性）
  crossover: (parent1: MyProblem, parent2: MyProblem) => {
    const ratio = Math.random();
    // 在对数空间进行插值
    const param1 = Math.exp(
      Math.log(parent1.param1) * ratio +
      Math.log(parent2.param1) * (1 - ratio)
    );
    // 在线性空间进行插值
    const param2 = 
      parent1.param2 * ratio +
      parent2.param2 * (1 - ratio);
    
    return [
      { param1, param2 },
      { param1: param2, param2: param1 }
    ];
  },
};

// 3. 运行优化
const result = await geneticOptimize(config);
```

## 详细配置说明

### 必需参数

- `populationSize`: 种群大小，建议在 50-200 之间
- `maxGenerations`: 最大迭代次数，建议根据问题复杂度设置
- `mutationRate`: 变异率 (0-1)，建议在 0.01-0.1 之间
- `crossoverRate`: 交叉率 (0-1)，建议在 0.6-0.9 之间
- `elitismRate`: 精英保留率 (0-1)，建议在 0.05-0.1 之间
- `fitnessFunction`: 适应度函数，返回数值越大表示解越好
- `generateIndividual`: 随机生成个体的函数
- `mutate`: 变异函数，对个体进行微小改变
- `crossover`: 交叉函数，结合两个父代生成两个子代

### 可选参数

- `calculateDiversity`: 计算种群多样性的函数（推荐实现）
  ```typescript
  // 示例：混合距离度量
  calculateDiversity: (population) => {
    let totalDistance = 0;
    let count = 0;
    
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        // 对数空间距离（用于指数级参数）
        const logDistance = Math.abs(
          Math.log2(population[i].param1) -
          Math.log2(population[j].param1)
        );
        
        // 线性空间距离（用于线性参数）
        const linearDistance = Math.abs(
          population[i].param2 -
          population[j].param2
        );
        
        // 归一化并组合距离
        const distance = Math.sqrt(
          (logDistance / LOG_SCALE) ** 2 +
          (linearDistance / LINEAR_SCALE) ** 2
        );
        
        totalDistance += distance;
        count++;
      }
    }
    
    return count > 0 ? totalDistance / count : 0;
  }
  ```
  
- `terminationCondition`: 提前终止条件
- `adaptiveParams`: 自适应参数配置
  ```typescript
  {
    minMutationRate: 0.001,    // 最小变异率
    maxMutationRate: 0.5,      // 最大变异率
    minCrossoverRate: 0.5,     // 最小交叉率
    maxCrossoverRate: 0.9,     // 最大交叉率
    diversityThreshold: 0.1    // 多样性阈值
  }
  ```

### 回调函数

```typescript
callbacks: {
  // 每代进化完成后的回调
  onGeneration: (generation, best, avg, diversity) => {
    console.log(
      `Generation ${generation}: ` +
      `Best = ${best.toFixed(4)}, ` +
      `Avg = ${avg.toFixed(4)}, ` +
      `Diversity = ${diversity.toFixed(4)}`
    );
  },
  
  // 找到新的最优解时的回调
  onNewBest: (individual, fitness) => {
    console.log(
      'New best solution found:',
      `\nParameters: ${JSON.stringify(individual)}`,
      `\nFitness: ${fitness.toFixed(4)}`
    );
  }
}
```

## 返回结果

```typescript
interface GeneticResult<T> {
  bestIndividual: T;          // 最佳个体
  bestFitness: number;        // 最佳适应度
  generations: number;        // 迭代次数
  history: number[];         // 适应度历史
  finalPopulation: T[];      // 最终种群
  diversityHistory?: number[]; // 多样性历史
  terminationReason?: string; // 终止原因
}
```

## 最佳实践

1. **参数空间处理**
   - 指数级参数（如学习率）在对数空间中变异和交叉
   - 线性参数（如动量）在线性空间中变异和交叉
   - 离散参数（如批量大小）使用整数约束

2. **适应度函数设计**
   - 对无效参数返回 -Infinity
   - 使用相对误差而不是绝对误差
   - 为不同参数设置合适的权重

3. **数值稳定性**
   - 使用 Math.log2 代替 Math.log
   - 在计算前检查参数有效性
   - 避免除以接近零的数

4. **多样性维护**
   - 在合适的空间计算距离
   - 对不同类型的参数使用不同的度量
   - 归一化并组合不同的距离

## 示例

查看 `example.ts` 获取两个完整示例：
1. 连续函数优化：优化二维函数 f(x,y) = -(x² + y²)
2. 超参数调优：优化神经网络的学习率、动量和批量大小

## 注意事项

1. 确保参数在有效范围内
2. 处理所有可能的数值问题
3. 选择合适的参数空间
4. 设计稳定的适应度函数
5. 实现合理的多样性度量

## 调试建议

1. 监控种群多样性变化
2. 观察参数分布情况
3. 检查数值稳定性
4. 分析收敛速度
5. 调整优化策略
