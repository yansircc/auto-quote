import { describe, it, expect } from 'vitest'
import { calculateMinArea } from '../min-area'

describe('calculateMinArea', () => {
  it('应该计算出正确的最小面积', () => {
    const testProducts = [
      { length: 300, width: 100 },
      { length: 250, width: 100 },
      { length: 230, width: 180 },
    ]

    const result = calculateMinArea(testProducts)

    expect(result.width).toBe(315)
    expect(result.length).toBe(390)
    expect(result.area).toBe(122850)

    // Additional checks to ensure the layout is valid
    expect(result.layout).toBeDefined()
    expect(result.layout.length).toBe(testProducts.length)
  })

  it('应该计算出正确的最小面积', () => {
    const testProducts = [
      { length: 120, width: 60 },
      { length: 120, width: 60 },
      { length: 40, width: 40 },
      { length: 40, width: 40 },
    ]

    const result = calculateMinArea(testProducts)

    expect(result.width).toBe(150)
    expect(result.length).toBe(190)
    expect(result.area).toBe(28500)

    // Additional checks
    expect(result.layout).toBeDefined()
    expect(result.layout.length).toBe(testProducts.length)
  })
})