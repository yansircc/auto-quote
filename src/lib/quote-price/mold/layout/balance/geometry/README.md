# 几何平衡优化系统

## 系统概述

`geometric-balance.ts` 是一个专门用于评估和优化注塑模具中多个型腔几何平衡性的系统。该系统通过多个维度的评分机制，确保模具中的型腔在几何特性上达到最佳平衡状态，从而提高注塑成型的质量和效率。

## 评分维度

系统从以下四个关键维度进行评分：

1. **体积平衡性 (35%)**
   - 评估所有型腔的体积比例关系
   - 体积比例越接近，得分越高
   - 体积比 > 0.8 得高分（85-100分）
   - 体积比 0.4-0.8 得中分（50-85分）
   - 体积比 0.1-0.4 得低分（0-50分）

2. **长宽比评分 (35%)**
   - 评估每个型腔的形状规则性
   - 计算最长边与最短边的比值
   - 比值越接近1（立方体），得分越高
   - 超过2的比值被认为是过于细长

3. **形状相似度 (15%)**
   - 评估型腔之间的形状一致性
   - 通过标准化维度进行比较
   - 考虑维度比例的相似程度

4. **维度一致性 (15%)**
   - 分别评估宽、高、深三个维度的统一性
   - 使用变异系数评估维度分布
   - 关注极端值对整体平衡的影响

## 优化难点

1. **多维度权衡**
   - 四个评分维度之间存在相互制约关系
   - 优化某一维度可能会导致其他维度性能下降
   - 需要在多个目标之间找到最佳平衡点

2. **搜索空间复杂性**
   - 参数空间高维且非线性
   - 存在多个局部最优解
   - 参数之间的交互效应复杂

3. **评分函数的连续性**
   - 需要保证评分函数在边界处平滑过渡
   - 避免硬阈值导致的优化不稳定
   - 确保评分对微小变化有适当的敏感度

## 优化方案

为了解决上述难点，我们采用了两层优化策略：

1. **第一层：遗传算法**
   - 用于在全局范围内搜索可能的最优解
   - 能够处理多维度非线性优化问题
   - 通过进化策略避免陷入局部最优

2. **第二层：暴力枚举**
   - 在遗传算法找到的promising区域进行精细搜索
   - 确保在局部范围内找到最优解
   - 验证解的稳定性和可靠性

## 验证与测试

在 `__tests__` 目录中包含了完整的测试用例集：
- 边界情况测试（空列表、单个型腔等）
- 不同体积比例组合的测试
- 各种形状特征的测试
- 维度一致性的极端情况测试

通过这些测试，我们：
1. 验证了评分系统的正确性
2. 确保了优化算法的稳定性
3. 找到了最优配置参数

## 最佳实践

经过大量测试和优化，我们已经找到了一组表现良好的默认配置参数，这些参数：
- 在大多数常见情况下能够给出合理的评分
- 对极端情况有足够的容错性
- 能够平衡各个评分维度的重要性

这些默认配置已经被设置为系统的基准配置，但用户仍可以根据具体需求进行调整。