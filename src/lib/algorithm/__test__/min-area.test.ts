import { describe, it, expect } from 'vitest'
import { calculateMinArea } from '../min-area'
import type { Product } from '@/types/geometry';
import { mockProducts } from '../balance/mockData'

describe('calculateMinArea', () => {
  it('应该计算出正确的最小面积 - 大型产品', () => {
    const testProducts: Product[] = [
      { id: 0, weight: 100, dimensions: { length: 300, width: 100, height: 50 } },
      { id: 1, weight: 100, dimensions: { length: 250, width: 100, height: 50 } },
      { id: 2, weight: 100, dimensions: { length: 230, width: 180, height: 50 } },
    ]

    const result = calculateMinArea(testProducts) 
    console.log('大型产品布局结果:', JSON.stringify(result, null, 2))

    // Width and length may be swapped but area should be the same
    const expectedArea = 122850
    expect(result.width * result.length).toBe(expectedArea)

    // Additional checks to ensure the layout is valid
    expect(result.layout).toBeDefined()
    expect(result.layout.length).toBe(testProducts.length)
  })

  it('应该计算出正确的最小面积 - 小型产品', () => {
    const testProducts: Product[] = [
      { id: 0, weight: 100, dimensions: { length: 120, width: 60, height: 50 } },
      { id: 1, weight: 100, dimensions: { length: 120, width: 60, height: 50 } },
      { id: 2, weight: 100, dimensions: { length: 40, width: 40, height: 50 } },
      { id: 3, weight: 100, dimensions: { length: 40, width: 40, height: 50 } },
    ]

    const result = calculateMinArea(testProducts)
    console.log('小型产品布局结果:', JSON.stringify(result, null, 2))

    // Width and length may be swapped but area should be the same
    const expectedArea = 28500
    expect(result.width * result.length).toBe(expectedArea)

    // Additional checks
    expect(result.layout).toBeDefined()
    expect(result.layout.length).toBe(testProducts.length)
  })

  it('应该计算出正确的最小面积 - Mock产品数据', () => {
    const result = calculateMinArea(mockProducts)
    console.log('Mock产品布局结果:', JSON.stringify(result, null, 2))

    // Check layout validity
    expect(result.layout).toBeDefined()
    expect(result.layout.length).toBe(mockProducts.length)

    // Print layout details
    console.log('布局详情:')
    result.layout.forEach((item, index) => {
      console.log(`产品 ${index + 1}:`, {
        position: { x: item.x, y: item.y },
        dimensions: { width: item.width, height: item.height },
        rotated: item.rotated
      })
    })
  })
})

// bun test src/lib/algorithm/__test__/min-area.test.ts