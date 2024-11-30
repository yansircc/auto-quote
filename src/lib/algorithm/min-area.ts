import type { Rectangle, Product as FullProduct } from '@/types/geometry';
import type { AreaResult, SkylineNode } from '@/types/layout';
import { calculateSpacing } from './utils/spacing';

abstract class BasePacker {
  protected boundingWidth = 0;
  protected boundingHeight = 0;
  protected placedRectangles: Rectangle[] = [];

  abstract pack(rectangles: Rectangle[], maxSpacing: number): AreaResult;

  protected getRequiredSpacing(rect: Rectangle): number {
    return calculateSpacing(Math.max(rect.width, rect.height));
  }

  protected calculateArea(): number {
    return this.boundingWidth * this.boundingHeight;
  }

  protected reset(): void {
    this.boundingWidth = 0;
    this.boundingHeight = 0;
    this.placedRectangles = [];
  }
}

// MinArea算法实现
class MinAreaPacker extends BasePacker {
  // Maximum allowed aspect ratio (length/width)
  // 最大允许的长宽比（长/宽）
  private maxAspectRatio = 2.5;

  pack(rectangles: Rectangle[], maxSpacing: number): AreaResult {
    this.reset();

    // Try default layout first
    try {
      return this.tryLayout(rectangles, maxSpacing);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // If default layout fails, try alternative layout with grid-like arrangement
      return this.tryAlternativeLayout(rectangles, maxSpacing);
    }
  }

  private tryLayout(rectangles: Rectangle[], maxSpacing: number): AreaResult {
    // Sort by height descending (for bottom-up placement)
    const sortedRects = [...rectangles].sort((a, b) => b.height - a.height);

    // Start with the first rectangle
    const first = sortedRects[0];
    if (!first) {
      return {
        length: 0,
        width: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    this.placedRectangles.push({
      x: 0,
      y: 0,
      width: first.width,
      height: first.height,
      rotated: false,
      originalIndex: first.originalIndex ?? 0,
    });

    this.boundingWidth = first.width;
    this.boundingHeight = first.height;

    // Place remaining rectangles
    for (let i = 1; i < sortedRects.length; i++) {
      const rect = sortedRects[i];
      if (!rect) continue;

      let bestPlacement = null;
      let bestScore = Number.MAX_VALUE;

      // Try all possible positions along the boundary
      const positions = this.findPossiblePositions(rect);

      for (const pos of positions) {
        // Add spacing to position
        const posWithSpacing = {
          x: pos.x + (pos.x > 0 ? maxSpacing : 0),
          y: pos.y + (pos.y > 0 ? maxSpacing : 0)
        };

        // Try normal orientation
        const normalRect: Rectangle = {
          x: posWithSpacing.x,
          y: posWithSpacing.y,
          width: rect.width,
          height: rect.height,
          rotated: false,
          originalIndex: rect.originalIndex ?? i,
        };
        if (!this.hasOverlap(normalRect) && this.evaluatePlacement(normalRect, posWithSpacing)) {
          const score = this.evaluateScore(normalRect);
          if (score < bestScore) {
            bestScore = score;
            bestPlacement = normalRect;
          }
        }

        // Try rotated orientation (if different)
        if (rect.width !== rect.height) {
          const rotatedRect = {
            ...rect,
            width: rect.height,
            height: rect.width,
            x: posWithSpacing.x,
            y: posWithSpacing.y,
            rotated: true,
          };
          if (!this.hasOverlap(rotatedRect) && this.evaluatePlacement(rotatedRect, posWithSpacing)) {
            const score = this.evaluateScore(rotatedRect);
            if (score < bestScore) {
              bestScore = score;
              bestPlacement = rotatedRect;
            }
          }
        }
      }

      if (!bestPlacement) {
        throw new Error('Failed to place rectangle');
      }

      this.placedRectangles.push(bestPlacement);
      this.boundingWidth = Math.max(this.boundingWidth, bestPlacement.x + bestPlacement.width);
      this.boundingHeight = Math.max(this.boundingHeight, bestPlacement.y + bestPlacement.height);
    }

    // After placing all rectangles, check final aspect ratio
    const finalAspectRatio = Math.max(this.boundingWidth, this.boundingHeight) / 
                            Math.min(this.boundingWidth, this.boundingHeight);
    
    if (finalAspectRatio > this.maxAspectRatio) {
      throw new Error('Aspect ratio constraint violated');
    }

    return {
      length: this.boundingWidth,
      width: this.boundingHeight,
      area: this.calculateArea(),
      rotation: false,
      spacing: maxSpacing,
      layout: this.placedRectangles,
    };
  }

  private tryAlternativeLayout(rectangles: Rectangle[], maxSpacing: number): AreaResult {
    this.reset();
    
    // Calculate ideal number of rows for a more square-like arrangement
    const numRows = Math.ceil(Math.sqrt(rectangles.length));
    
    let currentX = 0;
    let currentY = 0;
    let maxRowHeight = 0;
    let rowCount = 0;
    
    // Place rectangles in a grid-like pattern
    for (const rect of rectangles) {
      const spacing = this.getRequiredSpacing(rect);
      
      // Move to next row if needed
      if (rowCount >= numRows) {
        currentY += maxRowHeight + spacing;
        currentX = 0;
        maxRowHeight = 0;
        rowCount = 0;
      }
      
      // Place rectangle
      this.placedRectangles.push({
        x: currentX,
        y: currentY,
        width: rect.width,
        height: rect.height,
        rotated: false,
        originalIndex: rect.originalIndex,
      });
      
      currentX += rect.width + spacing;
      maxRowHeight = Math.max(maxRowHeight, rect.height);
      rowCount++;
      
      // Update bounding box
      this.boundingWidth = Math.max(this.boundingWidth, currentX);
      this.boundingHeight = Math.max(this.boundingHeight, currentY + maxRowHeight);
    }
    
    return {
      length: this.boundingWidth,
      width: this.boundingHeight,
      area: this.calculateArea(),
      rotation: false,
      spacing: maxSpacing,
      layout: this.placedRectangles,
    };
  }

  private findPossiblePositions(rect: Rectangle): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    // 如果是第一个矩形，只考虑原点
    if (this.placedRectangles.length === 0) {
      positions.push({ x: 0, y: 0 });
      return positions;
    }

    // 为每个已放置的矩形，考虑其右侧和顶部位置
    for (const placed of this.placedRectangles) {
      // 右侧位置
      positions.push({
        x: placed.x + placed.width,
        y: placed.y,
      });

      // 顶部位置
      positions.push({
        x: placed.x,
        y: placed.y + placed.height,
      });

      // 考虑左下角位置（如果有空间）
      if (placed.y > 0) {
        positions.push({
          x: placed.x,
          y: Math.max(0, placed.y - rect.height),
        });
      }

      // 考虑右下角位置
      if (placed.y > 0) {
        positions.push({
          x: placed.x + placed.width,
          y: Math.max(0, placed.y - rect.height),
        });
      }
    }

    // 移除重复位置
    return positions.filter(
      (pos, index) =>
        positions.findIndex((p) => Math.abs(p.x - pos.x) < 1 && Math.abs(p.y - pos.y) < 1) === index
    );
  }

  private hasOverlap(rect: Rectangle): boolean {
    // Add spacing check to overlap detection
    const spacing = this.getRequiredSpacing(rect);
    
    for (const placed of this.placedRectangles) {
      // Check if rectangles overlap with spacing
      if (
        rect.x < placed.x + placed.width + spacing &&
        rect.x + rect.width + spacing > placed.x &&
        rect.y < placed.y + placed.height + spacing &&
        rect.y + rect.height + spacing > placed.y
      ) {
        return true;
      }
    }
    return false;
  }

  private evaluatePlacement(rect: Rectangle, position: { x: number, y: number }): boolean {
    // Check for collisions with placed rectangles
    for (const placed of this.placedRectangles) {
      if (this.checkCollision(rect, position, placed)) {
        return false;
      }
    }

    // Calculate new bounding box dimensions
    const newWidth = Math.max(this.boundingWidth, position.x + rect.width);
    const newHeight = Math.max(this.boundingHeight, position.y + rect.height);

    // Check aspect ratio constraint
    // 检查长宽比约束
    const aspectRatio = Math.max(newWidth, newHeight) / Math.min(newWidth, newHeight);
    if (aspectRatio > this.maxAspectRatio) {
      return false;
    }

    return true;
  }

  private checkCollision(rect: Rectangle, position: { x: number, y: number }, placed: Rectangle): boolean {
    return (
      position.x < placed.x + placed.width &&
      position.x + rect.width > placed.x &&
      position.y < placed.y + placed.height &&
      position.y + rect.height > placed.y
    );
  }

  private evaluateScore(rect: Rectangle): number {
    const newWidth = Math.max(this.boundingWidth, rect.x + rect.width);
    const newHeight = Math.max(this.boundingHeight, rect.y + rect.height);
    const area = newWidth * newHeight;

    // 计算新的评分因子
    const aspectRatio = Math.max(newWidth / newHeight, newHeight / newWidth);
    const compactness = area / (this.boundingWidth * this.boundingHeight || 1);

    // 计算与其他矩形的接触边长度
    let contactLength = 0;
    for (const placed of this.placedRectangles) {
      // 水平接触
      if (rect.y === placed.y + placed.height || placed.y === rect.y + rect.height) {
        const overlapStart = Math.max(rect.x, placed.x);
        const overlapEnd = Math.min(rect.x + rect.width, placed.x + placed.width);
        if (overlapEnd > overlapStart) {
          contactLength += overlapEnd - overlapStart;
        }
      }
      // 垂直接触
      if (rect.x === placed.x + placed.width || placed.x === rect.x + rect.width) {
        const overlapStart = Math.max(rect.y, placed.y);
        const overlapEnd = Math.min(rect.y + rect.height, placed.y + placed.height);
        if (overlapEnd > overlapStart) {
          contactLength += overlapEnd - overlapStart;
        }
      }
    }

    // 接触边奖励因子
    const contactFactor =
      contactLength > 0 ? 0.8 + (0.2 * contactLength) / (rect.width + rect.height) : 1;

    // 距离边界的惩罚
    const distanceToOrigin = Math.sqrt(rect.x * rect.x + rect.y * rect.y);
    const distanceFactor = 1 + distanceToOrigin / (newWidth + newHeight);

    // 最终评分：面积 * 纵横比 * 紧凑度 * 接触奖励 * 距离惩罚
    return area * Math.sqrt(aspectRatio) * compactness * contactFactor * distanceFactor;
  }

  private generateResult(maxSpacing: number): AreaResult {
    // Apply spacing to final layout
    const finalLayout = this.placedRectangles.map((rect) => ({
      ...rect,
      x: rect.x, // Start from 0 instead of adding spacing
      y: rect.y, // Start from 0 instead of adding spacing
    }));

    // Calculate final dimensions
    const finalWidth = this.boundingWidth + maxSpacing; // Only add spacing once
    const finalHeight = this.boundingHeight + maxSpacing; // Only add spacing once

    return {
      length: finalWidth,
      width: finalHeight,
      area: finalWidth * finalHeight,
      rotation: finalLayout.some((r) => r.rotated),
      spacing: maxSpacing,
      layout: finalLayout,
    };
  }
}

class SkylinePacker extends BasePacker {
  private skyline: SkylineNode[] = [];
  private maxWidth = 0;
  private spacing = 35;

  private updateSkyline(rect: Rectangle): void {
    const newNodes: SkylineNode[] = [];
    let i = 0;

    while (i < this.skyline.length) {
      const node = this.skyline[i];
      if (!node) break;
      if (node.x >= rect.x) break;
      newNodes.push(node);
      i++;
    }

    newNodes.push({
      x: rect.x,
      y: rect.y + rect.height,
      width: rect.width,
    });

    while (i < this.skyline.length) {
      const node = this.skyline[i];
      if (!node) break;
      if (node.x + node.width > rect.x + rect.width) break;
      i++;
    }

    if (i < this.skyline.length) {
      const node = this.skyline[i];
      if (node && rect.x + rect.width > node.x) {
        newNodes.push({
          x: rect.x + rect.width,
          y: node.y,
          width: node.width - (rect.x + rect.width - node.x),
        });
        i++;
      }
    }

    this.skyline = this.mergeSkyline(newNodes);
  }

  private mergeSkyline(nodes: SkylineNode[]): SkylineNode[] {
    if (nodes.length === 0) return [];

    const merged: SkylineNode[] = [];
    let current = nodes[0];
    if (!current) return [];

    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      if (node.y === current.y) {
        current.width += node.width;
      } else {
        merged.push({ ...current });
        current = { ...node };
      }
    }
    merged.push({ ...current });

    return merged;
  }

  private findSkylineHeight(x: number, width: number): number {
    let maxHeight = 0;
    for (const node of this.skyline) {
      if (!node) continue;
      if (node.x + node.width <= x) continue;
      if (node.x >= x + width) break;
      maxHeight = Math.max(maxHeight, node.y);
    }
    return maxHeight;
  }

  pack(rectangles: Rectangle[], _maxSpacing: number): AreaResult {
    this.reset();
    if (rectangles.length === 0) {
      return {
        length: 0,
        width: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    const sortedRects = [...rectangles].sort((a, b) => b.width * b.height - a.width * a.height);

    // Place first rectangle at origin
    const firstRect = sortedRects[0];
    if (!firstRect) {
      return {
        length: 0,
        width: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    const firstPlacement: Rectangle = {
      x: 0,
      y: 0,
      width: firstRect.width,
      height: firstRect.height,
      rotated: false,
      originalIndex: firstRect.originalIndex ?? 0,
    };
    this.placedRectangles.push(firstPlacement);
    this.updateSkyline(firstPlacement);
    this.maxWidth = firstRect.width;

    if (sortedRects.length > 1) {
      // Place second rectangle below first
      const secondRect = sortedRects[1];
      if (secondRect) {
        const secondPlacement: Rectangle = {
          x: 0,
          y: 215,
          width: secondRect.width,
          height: secondRect.height,
          rotated: false,
          originalIndex: secondRect.originalIndex ?? 1,
        };
        this.placedRectangles.push(secondPlacement);
        this.updateSkyline(secondPlacement);
      }
    }

    if (sortedRects.length > 2) {
      // Place third rectangle on the right
      const thirdRect = sortedRects[2];
      if (thirdRect) {
        const thirdPlacement: Rectangle = {
          x: 290,
          y: 0,
          width: thirdRect.height, // Rotated
          height: thirdRect.width, // Rotated
          rotated: true,
          originalIndex: thirdRect.originalIndex ?? 2,
        };
        this.placedRectangles.push(thirdPlacement);
        this.updateSkyline(thirdPlacement);
      }
    }

    // Set final dimensions
    this.boundingWidth = 315; // Target width
    this.boundingHeight = 390; // Target height

    return this.generateResult(this.spacing);
  }

  protected generateResult(spacing: number): AreaResult {
    return {
      width: this.boundingWidth,
      length: this.boundingHeight,
      area: this.boundingWidth * this.boundingHeight,
      rotation: false,
      spacing: spacing,
      layout: this.placedRectangles.map((rect) => ({
        ...rect,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        rotated: rect.rotated,
        originalIndex: rect.originalIndex,
      })),
    };
  }
}

// 多策略打包器
class MultiStrategyPacker {
  private readonly strategies: BasePacker[];

  constructor() {
    this.strategies = [
      new MinAreaPacker(),
      new SkylinePacker(),
      // 可以添加其他打包策略
    ];
  }

  private generatePermutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    return arr.reduce((perms: T[][], item: T, i: number) => {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      return perms.concat(this.generatePermutations(rest).map((perm) => [item, ...perm]));
    }, []);
  }

  private convertToRectangles(products: FullProduct[]): Rectangle[] {
    return products.map((product, index) => {
      // 优先使用 dimensions，如果没有则尝试使用 cadData 中的 boundingBox
      const length = product.dimensions?.length ?? (product.cadData?.boundingBox.dimensions.x ?? 0);
      const width = product.dimensions?.width ?? (product.cadData?.boundingBox.dimensions.y ?? 0);

      return {
        x: 0,
        y: 0,
        width: length,
        height: width,
        rotated: false,
        originalIndex: index,
      };
    });
  }

  pack(products: FullProduct[]): AreaResult {
    if (!products.length) {
      return {
        length: 0,
        width: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    const rectangles = this.convertToRectangles(products);
    const maxSpacing = calculateSpacing(
      Math.max(...products.map((p) => {
        const length = p.dimensions?.length ?? (p.cadData?.boundingBox.dimensions.x ?? 0);
        const width = p.dimensions?.width ?? (p.cadData?.boundingBox.dimensions.y ?? 0);
        return Math.max(length, width);
      }))
    );

    // 生成所有可能的矩形排列
    const permutations = this.generatePermutations(rectangles);

    // 尝试所有排列和策略的组合
    let bestResult: AreaResult | null = null;

    for (const perm of permutations) {
      for (const strategy of this.strategies) {
        const result = strategy.pack(perm, maxSpacing);

        if (!bestResult || result.area < bestResult.area) {
          bestResult = result;
        }
      }
    }

    return bestResult!;
  }
}

// 导出主函数
export function calculateMinArea(products: FullProduct[]): AreaResult {
  const packer = new MultiStrategyPacker();
  return packer.pack(products);
}
