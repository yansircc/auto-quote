# 对称性优化器

本模块专注于评估和优化模具布局中长方体的对称排列。

## 关键指标

1. 轴向对称性
   - 评估X、Y、Z轴的对称性
   - 检查镜像位置是否有对应的长方体
   - 计算与完美对称的偏差

2. 重心对称性
   - 分析重心位置
   - 评估整体重量分布
   - 考虑模具开合方向的对称性

## 实现指南

1. 核心配置（`core/config.ts`）
   - 定义对称性容差阈值
   - 设置轴向特定的对称权重
   - 配置重心参数

2. 评分系统（`scoring/calculator.ts`）
   - 实现轴向对称性计算
   - 评估重心定位
   - 计算综合对称性得分

3. 优化策略（`optimizer.ts`）
   - 平衡对称性要求
   - 考虑制造约束
   - 保持实用的布局效率