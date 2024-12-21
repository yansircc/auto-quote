import { calculateFlowBalance } from '../flow';
import type { Cavity } from '../types';  // 导入 Cavity 类型
import { describe, it, expect } from 'vitest';

describe('calculateFlowBalance', () => {
  const standardCavity: Cavity = {
    width: 100,
    height: 100,
    volume: 1000,
  };

  it('空型腔列表应该返回0分', () => {
    const score = calculateFlowBalance([]);
    expect(score).toBe(0);
  });

  it('单个型腔应该返回100分', () => {
    const score = calculateFlowBalance([standardCavity]);
    expect(score).toBe(100);
  });

  it('对称布局应该得到高分', () => {
    // 2x2 对称布局
    const cavities: Cavity[] = [
      { ...standardCavity, position: { x: 50, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 150, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 50, y: 150, z: 0 } },
      { ...standardCavity, position: { x: 150, y: 150, z: 0 } },
    ];
    const score = calculateFlowBalance(cavities);
    expect(score).toBeGreaterThan(90);
  });

  it('一字型布局应该得到较低分数', () => {
    // 水平排列的三个型腔
    const cavities: Cavity[] = [
      { ...standardCavity, position: { x: 50, y: 100, z: 0 } },
      { ...standardCavity, position: { x: 150, y: 100, z: 0 } },
      { ...standardCavity, position: { x: 250, y: 100, z: 0 } },
    ];
    const score = calculateFlowBalance(cavities);
    expect(score).toBeLessThan(60);
  });

  it('L型布局应该得到中等分数', () => {
    // L型布局的三个型腔
    const cavities: Cavity[] = [
      { ...standardCavity, position: { x: 50, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 150, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 50, y: 150, z: 0 } },
    ];
    const score = calculateFlowBalance(cavities);
    expect(score).toBeLessThan(85);
    expect(score).toBeGreaterThan(60);
  });

  it('不规则布局应该得到较低分数', () => {
    // 随机分布的四个型腔
    const cavities: Cavity[] = [
      { ...standardCavity, position: { x: 50, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 200, y: 50, z: 0 } },
      { ...standardCavity, position: { x: 50, y: 200, z: 0 } },
      { ...standardCavity, position: { x: 250, y: 250, z: 0 } },
    ];
    const score = calculateFlowBalance(cavities);
    expect(score).toBeLessThan(70);
  });
});
// bun test src/lib/quote-price/mold/layout/balance/__test__/flow.test.ts