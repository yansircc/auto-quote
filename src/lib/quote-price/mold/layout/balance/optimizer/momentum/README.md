# 动量优化器

本模块专注于优化模具布局中的动量平衡，通过评估力矩比率和相对标准差来优化动量分布。

## 关键指标

1. 力矩比率评估
   - 计算各方向的力矩比率
   - 评估与理想值1.0的偏差
   - 确保力矩分布均衡

2. 相对标准差分析
   - 计算动量分布的离散程度
   - 评估分布的稳定性
   - 控制极端值的影响

## 实现指南

1. 核心配置（`core/config.ts`）
   - 定义力矩比率阈值范围
   - 设置标准差容差参数
   - 配置评分权重系统

2. 评分系统（`scoring/calculator.ts`）
   - 实现力矩比率计算
   - 评估标准差指标
   - 计算综合平衡得分

3. 优化策略（`optimizer.ts`）
   - 平衡各方向动量
   - 最小化分布波动
   - 考虑工程实际约束
