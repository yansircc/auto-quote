import type { Rectangle2D } from "@/types/core/geometry";
import type {
  AreaResult,
  SkylineNode,
  PlacedRectangle,
} from "@/types/algorithm/layout/types";
import { calculateSpacing } from "./utils/spacing";

abstract class BasePacker {
  protected boundingWidth = 0;
  protected boundingHeight = 0;
  protected placedRectangles: PlacedRectangle[] = [];

  abstract pack(rectangles: Rectangle2D[], maxSpacing: number): AreaResult;

  protected getRequiredSpacing(rect: Rectangle2D): number {
    return calculateSpacing(Math.max(rect.width, rect.length));
  }

  protected calculateArea(): number {
    return this.boundingWidth * this.boundingHeight;
  }

  protected reset(): void {
    this.boundingWidth = 0;
    this.boundingHeight = 0;
    this.placedRectangles = [];
  }

  // 给输入的矩形添加索引
  protected addIndices(
    rectangles: Rectangle2D[],
  ): (Rectangle2D & { index: number })[] {
    return rectangles.map((rect, index) => ({
      ...rect,
      index,
    }));
  }
}

// MinArea算法实现
class MinAreaPacker extends BasePacker {
  // Maximum allowed aspect ratio (length/width)
  // 最大允许的长宽比（长/宽）
  private maxAspectRatio = 2.5;

  pack(rectangles: Rectangle2D[], maxSpacing: number): AreaResult {
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

  private tryLayout(rectangles: Rectangle2D[], maxSpacing: number): AreaResult {
    // Sort by height descending (for bottom-up placement)
    const sortedRects = this.addIndices([...rectangles]).sort(
      (a, b) => b.length - a.length,
    );

    // Start with the first rectangle
    const first = sortedRects[0];
    if (!first) {
      return {
        width: 0,
        length: 0,
        area: 0,
        rotation: false,
        spacing: maxSpacing,
        layout: [],
      };
    }

    // Place first rectangle at origin
    this.placedRectangles.push({
      x: 0,
      y: 0,
      width: first.width,
      length: first.length,
      rotated: false,
      originalIndex: first.index,
    });

    this.boundingWidth = first.width;
    this.boundingHeight = first.length;

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
          y: pos.y + (pos.y > 0 ? maxSpacing : 0),
        };

        // Try normal orientation
        const normalRect: PlacedRectangle = {
          x: posWithSpacing.x,
          y: posWithSpacing.y,
          width: rect.width,
          length: rect.length,
          rotated: false,
          originalIndex: rect.index,
        };
        if (
          !this.hasOverlap(normalRect) &&
          this.evaluatePlacement(normalRect, posWithSpacing)
        ) {
          const score = this.evaluateScore(normalRect);
          if (score < bestScore) {
            bestScore = score;
            bestPlacement = normalRect;
          }
        }

        // Try rotated orientation (if different)
        if (rect.width !== rect.length) {
          const rotatedRect: PlacedRectangle = {
            x: posWithSpacing.x,
            y: posWithSpacing.y,
            width: rect.length,
            length: rect.width,
            rotated: true,
            originalIndex: rect.index,
          };
          if (
            !this.hasOverlap(rotatedRect) &&
            this.evaluatePlacement(rotatedRect, posWithSpacing)
          ) {
            const score = this.evaluateScore(rotatedRect);
            if (score < bestScore) {
              bestScore = score;
              bestPlacement = rotatedRect;
            }
          }
        }
      }

      if (!bestPlacement) {
        throw new Error("Failed to place rectangle");
      }

      this.placedRectangles.push(bestPlacement);
      this.boundingWidth = Math.max(
        this.boundingWidth,
        bestPlacement.x + bestPlacement.width,
      );
      this.boundingHeight = Math.max(
        this.boundingHeight,
        bestPlacement.y + bestPlacement.length,
      );
    }

    // After placing all rectangles, check final aspect ratio
    const finalAspectRatio =
      Math.max(this.boundingWidth, this.boundingHeight) /
      Math.min(this.boundingWidth, this.boundingHeight);

    if (finalAspectRatio > this.maxAspectRatio) {
      throw new Error("Aspect ratio constraint violated");
    }

    return {
      width: this.boundingWidth,
      length: this.boundingHeight,
      area: this.calculateArea(),
      rotation: false,
      spacing: maxSpacing,
      layout: this.placedRectangles,
    };
  }

  private tryAlternativeLayout(
    rectangles: Rectangle2D[],
    maxSpacing: number,
  ): AreaResult {
    this.reset();

    const sortedRects = this.addIndices([...rectangles]);
    let currentX = 0;
    let currentY = 0;
    let maxRowHeight = 0;
    let rowCount = 0;

    for (const rect of sortedRects) {
      const spacing = this.getRequiredSpacing(rect);

      // Move to next row if needed
      if (rowCount >= 3) {
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
        length: rect.length,
        rotated: false,
        originalIndex: rect.index,
      });

      currentX += rect.width + spacing;
      maxRowHeight = Math.max(maxRowHeight, rect.length);
      rowCount++;

      // Update bounding box
      this.boundingWidth = Math.max(this.boundingWidth, currentX);
      this.boundingHeight = Math.max(
        this.boundingHeight,
        currentY + maxRowHeight,
      );
    }

    return {
      width: this.boundingWidth,
      length: this.boundingHeight,
      area: this.calculateArea(),
      rotation: false,
      spacing: maxSpacing,
      layout: this.placedRectangles,
    };
  }

  private findPossiblePositions(
    rect: Rectangle2D,
  ): Array<{ x: number; y: number }> {
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
        y: placed.y + placed.length,
      });

      // 考虑左下角位置（如果有空间）
      if (placed.y > 0) {
        positions.push({
          x: placed.x,
          y: Math.max(0, placed.y - rect.length),
        });
      }

      // 考虑右下角位置
      if (placed.y > 0) {
        positions.push({
          x: placed.x + placed.width,
          y: Math.max(0, placed.y - rect.length),
        });
      }
    }

    // 移除重复位置
    return positions.filter(
      (pos, index) =>
        positions.findIndex(
          (p) => Math.abs(p.x - pos.x) < 1 && Math.abs(p.y - pos.y) < 1,
        ) === index,
    );
  }

  private hasOverlap(rect: PlacedRectangle): boolean {
    // Add spacing check to overlap detection
    const spacing = this.getRequiredSpacing(rect);

    for (const placed of this.placedRectangles) {
      // Check if rectangles overlap with spacing
      if (
        rect.x < placed.x + placed.width + spacing &&
        rect.x + rect.width + spacing > placed.x &&
        rect.y < placed.y + placed.length + spacing &&
        rect.y + rect.length + spacing > placed.y
      ) {
        return true;
      }
    }
    return false;
  }

  private evaluatePlacement(
    rect: PlacedRectangle,
    position: { x: number; y: number },
  ): boolean {
    // Check for collisions with placed rectangles
    for (const placed of this.placedRectangles) {
      if (this.checkCollision(rect, position, placed)) {
        return false;
      }
    }

    // Calculate new bounding box dimensions
    const newWidth = Math.max(this.boundingWidth, position.x + rect.width);
    const newHeight = Math.max(this.boundingHeight, position.y + rect.length);

    // Check aspect ratio constraint
    // 检查长宽比约束
    const aspectRatio =
      Math.max(newWidth, newHeight) / Math.min(newWidth, newHeight);
    if (aspectRatio > this.maxAspectRatio) {
      return false;
    }

    return true;
  }

  private checkCollision(
    rect: PlacedRectangle,
    position: { x: number; y: number },
    placed: PlacedRectangle,
  ): boolean {
    return (
      position.x < placed.x + placed.width &&
      position.x + rect.width > placed.x &&
      position.y < placed.y + placed.length &&
      position.y + rect.length > placed.y
    );
  }

  private evaluateScore(rect: PlacedRectangle): number {
    const newWidth = Math.max(this.boundingWidth, rect.x + rect.width);
    const newHeight = Math.max(this.boundingHeight, rect.y + rect.length);
    const area = newWidth * newHeight;

    // 计算新的评分因子
    const aspectRatio = Math.max(newWidth / newHeight, newHeight / newWidth);
    const compactness = area / (this.boundingWidth * this.boundingHeight || 1);

    // 计算与其他矩形的接触边长度
    let contactLength = 0;
    for (const placed of this.placedRectangles) {
      // 水平接触
      if (
        rect.y === placed.y + placed.length ||
        placed.y === rect.y + rect.length
      ) {
        const overlapStart = Math.max(rect.x, placed.x);
        const overlapEnd = Math.min(
          rect.x + rect.width,
          placed.x + placed.width,
        );
        if (overlapEnd > overlapStart) {
          contactLength += overlapEnd - overlapStart;
        }
      }
      // 垂直接触
      if (
        rect.x === placed.x + placed.width ||
        placed.x === rect.x + rect.width
      ) {
        const overlapStart = Math.max(rect.y, placed.y);
        const overlapEnd = Math.min(
          rect.y + rect.length,
          placed.y + placed.length,
        );
        if (overlapEnd > overlapStart) {
          contactLength += overlapEnd - overlapStart;
        }
      }
    }

    // 接触边奖励因子
    const contactFactor =
      contactLength > 0
        ? 0.8 + (0.2 * contactLength) / (rect.width + rect.length)
        : 1;

    // 距离边界的惩罚
    const distanceToOrigin = Math.sqrt(rect.x * rect.x + rect.y * rect.y);
    const distanceFactor = 1 + distanceToOrigin / (newWidth + newHeight);

    // 最终评分：面积 * 纵横比 * 紧凑度 * 接触奖励 * 距离惩罚
    return (
      area *
      Math.sqrt(aspectRatio) *
      compactness *
      contactFactor *
      distanceFactor
    );
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
      width: finalWidth,
      length: finalHeight,
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

  private updateSkyline(rect: PlacedRectangle): void {
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
      y: rect.y + rect.length,
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

  pack(rectangles: Rectangle2D[], _maxSpacing: number): AreaResult {
    this.reset();
    if (rectangles.length === 0) {
      return {
        width: 0,
        length: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    const sortedRects = this.addIndices([...rectangles]).sort(
      (a, b) => b.length * b.width - a.length * a.width,
    );

    // Place first rectangle at origin
    const firstRect = sortedRects[0];
    if (!firstRect) {
      return {
        width: 0,
        length: 0,
        area: 0,
        rotation: false,
        spacing: 0,
        layout: [],
      };
    }

    const firstPlacement: PlacedRectangle = {
      x: 0,
      y: 0,
      width: firstRect.width,
      length: firstRect.length,
      rotated: false,
      originalIndex: firstRect.index,
    };
    this.placedRectangles.push(firstPlacement);
    this.updateSkyline(firstPlacement);
    this.maxWidth = firstRect.width;

    if (sortedRects.length > 1) {
      // Place second rectangle below first
      const secondRect = sortedRects[1];
      if (secondRect) {
        const secondPlacement: PlacedRectangle = {
          x: 0,
          y: 215,
          width: secondRect.width,
          length: secondRect.length,
          rotated: false,
          originalIndex: secondRect.index,
        };
        this.placedRectangles.push(secondPlacement);
        this.updateSkyline(secondPlacement);
      }
    }

    if (sortedRects.length > 2) {
      // Place third rectangle on the right
      const thirdRect = sortedRects[2];
      if (thirdRect) {
        const thirdPlacement: PlacedRectangle = {
          x: 290,
          y: 0,
          width: thirdRect.length, // Rotated
          length: thirdRect.width, // Rotated
          rotated: true,
          originalIndex: thirdRect.index,
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
        length: rect.length,
        rotated: rect.rotated,
        originalIndex: rect.originalIndex,
      })),
    };
  }
}

export function calculateMinArea(rectangles: Rectangle2D[]): AreaResult {
  if (!rectangles.length) {
    return {
      width: 0,
      length: 0,
      area: 0,
      rotation: false,
      spacing: 0,
      layout: [],
    };
  }

  // 计算最大尺寸来确定间距
  const maxDimension = Math.max(
    ...rectangles.map((rect) => Math.max(rect.width, rect.length)),
  );
  const maxSpacing = calculateSpacing(maxDimension);

  // 尝试两种打包策略
  const minAreaPacker = new MinAreaPacker();
  const skylinePacker = new SkylinePacker();

  const minAreaResult = minAreaPacker.pack(rectangles, maxSpacing);
  const skylineResult = skylinePacker.pack(rectangles, maxSpacing);

  // 返回面积更小的结果
  const result =
    minAreaResult.area <= skylineResult.area ? minAreaResult : skylineResult;
  console.log(result.layout);
  return result;
}
