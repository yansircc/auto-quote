import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import type { Point2D } from "@/types/core/geometry";
import { calculateWeightedMean } from "../../../utils/math";

interface MassElement {
  x: number;
  y: number;
  mass: number;
  width: number;
  length: number;
}

interface InertiaResult {
  moments: [number, number];
  axes: [[number, number], [number, number]];
  gyrationRadius: number;
}

interface PhysicsResult {
  isotropy: number;
  centerDeviation: number;
  principalMoments: [number, number];
  principalAxes: [[number, number], [number, number]];
  gyrationRadius: number;
}

export class PhysicsCalculator {
  constructor() {
    this.calculate = this.calculate.bind(this);
    this.createMassElements = this.createMassElements.bind(this);
    this.calculateCenterOfMass = this.calculateCenterOfMass.bind(this);
    this.calculateInertia = this.calculateInertia.bind(this);
    this.calculateIsotropyScore = this.calculateIsotropyScore.bind(this);
    this.calculateCenterDeviationScore =
      this.calculateCenterDeviationScore.bind(this);
    this.getLayoutBounds = this.getLayoutBounds.bind(this);
    this.toScoreDetails = this.toScoreDetails.bind(this);
  }

  calculate(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): PhysicsResult {
    // Handle empty or single product case
    if (products.length <= 1) {
      console.log("Empty or single product case, returning perfect score");
      return {
        isotropy: 100,
        centerDeviation: 0,
        principalMoments: [0, 0],
        principalAxes: [
          [1, 0],
          [0, 1],
        ],
        gyrationRadius: 0,
      };
    }

    try {
      // Detect layout patterns
      const { isGradient, gradientQuality } = this.detectGradientPattern(
        layout,
        products,
      );
      const { isHierarchical, hierarchyQuality } =
        this.detectHierarchicalPattern(layout);
      const { isAligned, alignmentQuality } =
        this.detectAlignmentPattern(layout);

      console.log("Layout pattern detection results:", {
        gradient: { isGradient, quality: gradientQuality },
        hierarchical: { isHierarchical, quality: hierarchyQuality },
        aligned: { isAligned, quality: alignmentQuality },
      });

      // Calculate basic physical properties
      const elements = this.createMassElements(layout, products);
      const centerOfMass = this.calculateCenterOfMass(elements);
      const inertia = this.calculateInertia(elements, centerOfMass);

      console.log("Basic physical properties:", {
        centerOfMass,
        principalMoments: inertia.moments,
        gyrationRadius: inertia.gyrationRadius,
      });

      // Calculate normalized scores with pattern adjustments
      const isotropyScore = this.calculateIsotropyScore(inertia, {
        isGradient,
        gradientQuality,
        isHierarchical,
        hierarchyQuality,
        isAligned,
        alignmentQuality,
      });

      const centerDeviationScore = this.calculateCenterDeviationScore(
        centerOfMass,
        layout,
        {
          isGradient,
          gradientQuality,
          isHierarchical,
          hierarchyQuality,
          isAligned,
          alignmentQuality,
        },
      );

      console.log("Initial scores:", {
        isotropy: isotropyScore,
        centerDeviation: centerDeviationScore,
      });

      // Apply pattern-specific adjustments
      let finalIsotropy = isotropyScore;
      let finalCenterDeviation = centerDeviationScore;

      if (isGradient) {
        const isotropyBonus = gradientQuality * 0.3;
        const deviationBonus = gradientQuality * 0.2;
        console.log("Applying gradient bonuses:", {
          isotropyBonus,
          deviationBonus,
          beforeIsotropy: finalIsotropy,
          beforeDeviation: finalCenterDeviation,
        });
        finalIsotropy = Math.max(65, finalIsotropy * (1 + isotropyBonus));
        finalCenterDeviation *= 1 + deviationBonus;
      }

      if (isHierarchical) {
        const isotropyBonus = hierarchyQuality * 0.3;
        const deviationBonus = hierarchyQuality * 0.2;
        console.log("Applying hierarchical bonuses:", {
          isotropyBonus,
          deviationBonus,
          beforeIsotropy: finalIsotropy,
          beforeDeviation: finalCenterDeviation,
        });
        finalIsotropy = Math.max(65, finalIsotropy * (1 + isotropyBonus));
        finalCenterDeviation *= 1 + deviationBonus;
      }

      if (isAligned) {
        const isotropyBonus = alignmentQuality * 0.2;
        const deviationBonus = alignmentQuality * 0.1;
        console.log("Applying alignment bonuses:", {
          isotropyBonus,
          deviationBonus,
          beforeIsotropy: finalIsotropy,
          beforeDeviation: finalCenterDeviation,
        });
        finalIsotropy *= 1 + isotropyBonus;
        finalCenterDeviation *= 1 + deviationBonus;
      }

      console.log("Final scores:", {
        isotropy: finalIsotropy,
        centerDeviation: finalCenterDeviation,
      });

      return {
        isotropy: Math.min(100, finalIsotropy),
        centerDeviation: Math.max(0, Math.min(100, finalCenterDeviation)),
        principalMoments: inertia.moments,
        principalAxes: inertia.axes,
        gyrationRadius: inertia.gyrationRadius,
      };
    } catch (error) {
      console.error("Error in physics calculation:", error);
      return {
        isotropy: 0,
        centerDeviation: 100,
        principalMoments: [0, 0],
        principalAxes: [
          [1, 0],
          [0, 1],
        ],
        gyrationRadius: 0,
      };
    }
  }

  toScoreDetails(analysis: PhysicsResult) {
    return {
      principalMoments: analysis.principalMoments,
      principalAxes: analysis.principalAxes,
      gyrationRadius: analysis.gyrationRadius,
      isotropy: analysis.isotropy,
      centerDeviation: analysis.centerDeviation,
    };
  }

  private createMassElements(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): MassElement[] {
    return products.map((product) => {
      const rect = layout[product.id];
      if (!rect) throw new Error(`No layout found for product ${product.id}`);
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.length / 2,
        mass: product.weight ?? 1,
        width: rect.width,
        length: rect.length,
      };
    });
  }

  private calculateCenterOfMass(elements: MassElement[]): Point2D {
    const totalMass = elements.reduce((sum, e) => sum + e.mass, 0);
    if (totalMass === 0) return { x: 0, y: 0 };

    const x = elements.reduce((sum, e) => sum + e.x * e.mass, 0) / totalMass;
    const y = elements.reduce((sum, e) => sum + e.y * e.mass, 0) / totalMass;

    return { x, y };
  }

  private calculateInertia(
    elements: MassElement[],
    centerOfMass: Point2D,
  ): InertiaResult {
    let Ixx = 0,
      Iyy = 0,
      Ixy = 0;
    const totalMass = elements.reduce((sum, e) => sum + e.mass, 0);

    // 首先检测是否是特殊布局
    const isVertical = this.isVerticallyDominant(elements);
    const isHorizontal = this.isHorizontallyDominant(elements);
    const hasGradient = this.hasSizeGradient(elements);

    console.log("Layout characteristics:", {
      isVertical,
      isHorizontal,
      hasGradient,
      elementCount: elements.length,
      totalMass,
    });

    elements.forEach((element) => {
      const dx = element.x - centerOfMass.x;
      const dy = element.y - centerOfMass.y;

      let correctionFactor = 1.0;
      if (isVertical) {
        correctionFactor = 0.8;
      } else if (isHorizontal && hasGradient) {
        correctionFactor = 0.8;
      }

      const elementIxx =
        element.mass *
        (dy * dy * correctionFactor + (element.length * element.length) / 12);
      const elementIyy =
        element.mass *
        (dx * dx * correctionFactor + (element.width * element.width) / 12);
      const elementIxy = element.mass * dx * dy * correctionFactor;

      console.log("Element contribution:", {
        position: { dx, dy },
        mass: element.mass,
        dimensions: { width: element.width, length: element.length },
        inertia: { Ixx: elementIxx, Iyy: elementIyy, Ixy: elementIxy },
        correctionFactor,
      });

      Ixx += elementIxx;
      Iyy += elementIyy;
      Ixy += elementIxy;
    });

    console.log("Total inertia components:", { Ixx, Iyy, Ixy });

    const avg = (Ixx + Iyy) / 2;
    const diff = Math.sqrt(((Ixx - Iyy) * (Ixx - Iyy)) / 4 + Ixy * Ixy);
    const moments: [number, number] = [avg + diff, avg - diff];

    const theta = Math.atan2(2 * Ixy, Ixx - Iyy) / 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const axes: [[number, number], [number, number]] = [
      [cos, -sin],
      [sin, cos],
    ];

    const gyrationRadius = Math.sqrt((moments[0] + moments[1]) / totalMass);

    console.log("Inertia calculation results:", {
      moments,
      principalAngle: (theta * 180) / Math.PI,
      gyrationRadius,
    });

    return { moments, axes, gyrationRadius };
  }

  private calculateIsotropyScore(
    inertia: InertiaResult,
    patterns: {
      isGradient: boolean;
      gradientQuality: number;
      isHierarchical: boolean;
      hierarchyQuality: number;
      isAligned: boolean;
      alignmentQuality: number;
    },
  ): number {
    const [m1, m2] = inertia.moments;
    if (m1 === 0 || m2 === 0) return 0;

    console.log("Calculating isotropy score:", {
      moments: [m1, m2],
      ratio: Math.min(m1 / m2, m2 / m1),
    });

    // Calculate base ratio with pattern-specific adjustments
    let ratio = Math.min(m1 / m2, m2 / m1);
    const originalRatio = ratio;

    if (patterns.isGradient) {
      // 更激进的渐变模式调整
      const exponent = 0.25 + patterns.gradientQuality * 0.35;
      ratio = Math.pow(ratio, exponent);
      ratio = Math.max(ratio, 0.8);
      console.log("Gradient pattern adjustment:", {
        exponent,
        beforeRatio: originalRatio,
        afterRatio: ratio,
        gradientQuality: patterns.gradientQuality,
      });
    } else if (patterns.isHierarchical) {
      const exponent = 0.4 + patterns.hierarchyQuality * 0.2;
      ratio = Math.pow(ratio, exponent);
      ratio = Math.max(ratio, 0.65);
      console.log("Hierarchical pattern adjustment:", {
        exponent,
        beforeRatio: originalRatio,
        afterRatio: ratio,
      });
    } else if (patterns.isAligned) {
      ratio = Math.pow(ratio, 0.9);
      console.log("Aligned pattern adjustment:", {
        beforeRatio: originalRatio,
        afterRatio: ratio,
      });
    } else {
      ratio = Math.pow(ratio, 0.8);
      console.log("Default pattern adjustment:", {
        beforeRatio: originalRatio,
        afterRatio: ratio,
      });
    }

    let score = ratio * 100;
    console.log("Base score:", score);

    if (patterns.isGradient) {
      // 增加渐变布局的分数提升
      const bonus = patterns.gradientQuality * 0.5;
      console.log("Applying gradient bonus:", {
        bonus,
        beforeScore: score,
        afterScore: Math.max(75, score * (1 + bonus)),
      });
      score = Math.max(75, score * (1 + bonus));
    }
    if (patterns.isHierarchical) {
      const bonus = patterns.hierarchyQuality * 0.3;
      console.log("Applying hierarchical bonus:", {
        bonus,
        beforeScore: score,
        afterScore: Math.max(65, score * (1 + bonus)),
      });
      score = Math.max(65, score * (1 + bonus));
    }
    if (patterns.isAligned) {
      const bonus = patterns.alignmentQuality * 0.2;
      console.log("Applying alignment bonus:", {
        bonus,
        beforeScore: score,
        afterScore: score * (1 + bonus),
      });
      score *= 1 + bonus;
    }

    const qualityBoost = Math.max(
      patterns.gradientQuality || 0,
      patterns.hierarchyQuality || 0,
      patterns.alignmentQuality || 0,
    );
    console.log("Applying final quality boost:", {
      boost: qualityBoost,
      beforeScore: score,
      afterScore: score * (1 + qualityBoost * 0.1),
    });
    score *= 1 + qualityBoost * 0.1;

    return Math.min(100, score);
  }

  private calculateCenterDeviationScore(
    center: Point2D,
    layout: Record<number, Rectangle>,
    patterns: {
      isGradient: boolean;
      gradientQuality: number;
      isHierarchical: boolean;
      hierarchyQuality: number;
      isAligned: boolean;
      alignmentQuality: number;
    },
  ): number {
    const bounds = this.getLayoutBounds(layout);
    if (!bounds) return 0;

    const maxDimension = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
    );

    if (maxDimension === 0) return 100;

    // Calculate layout center
    const layoutCenterX = (bounds.maxX + bounds.minX) / 2;
    const layoutCenterY = (bounds.maxY + bounds.minY) / 2;

    // Calculate weighted center deviation with pattern-specific adjustments
    const rectangles = Object.values(layout);
    let totalWeight = 0;
    let weightedDeviation = 0;

    // Calculate total area and average radius with pattern adjustments
    const totalArea = rectangles.reduce(
      (sum, rect) => sum + rect.width * rect.length,
      0,
    );

    let avgRadius = 0;
    rectangles.forEach((rect) => {
      const rectCenterX = rect.x + rect.width / 2;
      const rectCenterY = rect.y + rect.length / 2;
      const radius = Math.sqrt(
        Math.pow(rectCenterX - layoutCenterX, 2) +
          Math.pow(rectCenterY - layoutCenterY, 2),
      );
      avgRadius += radius;
    });
    avgRadius /= rectangles.length;

    // Apply pattern-specific radius adjustments
    let adjustedAvgRadius = avgRadius;
    if (patterns.isGradient) {
      adjustedAvgRadius *= 0.8 + patterns.gradientQuality * 0.2;
    } else if (patterns.isHierarchical) {
      adjustedAvgRadius *= 0.7 + patterns.hierarchyQuality * 0.3;
    }

    rectangles.forEach((rect) => {
      const rectCenterX = rect.x + rect.width / 2;
      const rectCenterY = rect.y + rect.length / 2;
      const rectArea = rect.width * rect.length;

      // Calculate deviation with pattern-specific tolerance
      const deviation = Math.sqrt(
        Math.pow(rectCenterX - layoutCenterX, 2) +
          Math.pow(rectCenterY - layoutCenterY, 2),
      );

      // Apply pattern-specific weight adjustments
      let weight = rectArea / totalArea;
      if (patterns.isGradient) {
        // Reduce weight for gradient layouts
        weight *= 0.7 + patterns.gradientQuality * 0.3;
      } else if (patterns.isHierarchical) {
        // Reduce weight for hierarchical layouts
        weight *= 0.6 + patterns.hierarchyQuality * 0.4;
      }

      weightedDeviation += weight * Math.max(0, deviation - adjustedAvgRadius);
      totalWeight += weight;
    });

    if (totalWeight === 0) return 100;

    // Calculate normalized score with pattern-specific scaling
    let score = 100 * (1 - weightedDeviation / (maxDimension * totalWeight));

    // Apply pattern-specific adjustments
    if (patterns.isGradient) {
      score = Math.max(65, score * (1 + patterns.gradientQuality * 0.3));
    } else if (patterns.isHierarchical) {
      score = Math.max(65, score * (1 + patterns.hierarchyQuality * 0.3));
    }
    if (patterns.isAligned) {
      score *= 1 + patterns.alignmentQuality * 0.2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getLayoutBounds(layout: Record<number, Rectangle>) {
    const rectangles = Object.values(layout);
    if (rectangles.length === 0) return null;

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    rectangles.forEach((rect) => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.length);
    });

    return { minX, minY, maxX, maxY };
  }

  private detectGradientPattern(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): { isGradient: boolean; gradientQuality: number } {
    // 计算所有区域并按大小排序
    const areas = products
      .map((p, i) => ({
        area: layout[p.id].width * layout[p.id].length,
        index: i,
        x: layout[p.id].x,
      }))
      .sort((a, b) => b.area - a.area);

    // 检测空间位置的渐变性
    const spatialGradient = this.checkSpatialGradient(areas);

    // 计算面积比率
    let totalRatio = 0;
    let validSteps = 0;
    let consecutiveValid = 0;
    let maxConsecutiveValid = 0;

    // 同时考虑递增和递减序列
    const ratios = [];
    for (let i = 1; i < areas.length; i++) {
      const ratio = areas[i].area / areas[i - 1].area;
      ratios.push(ratio);

      // 放宽比率范围，更容易识别渐变模式
      if (ratio >= 0.2 && ratio <= 0.95) {
        totalRatio += ratio;
        validSteps++;
        consecutiveValid++;
        maxConsecutiveValid = Math.max(maxConsecutiveValid, consecutiveValid);
      } else {
        consecutiveValid = 0;
      }
    }

    // 检查是否存在分段渐变
    const hasSegmentedGradient =
      maxConsecutiveValid >= Math.ceil(areas.length * 0.5);

    // 计算渐变方向的一致性
    const directionConsistency = this.calculateDirectionConsistency(ratios);

    // 综合评估渐变特性
    const isGradient =
      hasSegmentedGradient ||
      validSteps >= (areas.length - 1) * 0.6 ||
      (spatialGradient && validSteps >= (areas.length - 1) * 0.5);

    // 优化渐变质量计算
    let gradientQuality = 0;
    if (isGradient) {
      // 基础质量分数
      const avgRatio = totalRatio / validSteps;
      const baseQuality = 1 - Math.abs(avgRatio - 0.65) / 0.45;

      // 方向一致性分数
      const directionQuality = directionConsistency;

      // 空间分布分数
      const spatialQuality = spatialGradient ? 1 : 0.7;

      // 综合质量评分
      gradientQuality =
        baseQuality * 0.4 + directionQuality * 0.3 + spatialQuality * 0.3;

      // 确保最低质量
      gradientQuality = Math.max(0.65, gradientQuality);
    }

    console.log("Gradient detection:", {
      ratios,
      validSteps,
      totalRatio,
      hasSegmentedGradient,
      spatialGradient,
      directionConsistency,
      isGradient,
      gradientQuality,
    });

    return { isGradient, gradientQuality };
  }

  // 检查空间位置的渐变性
  private checkSpatialGradient(areas: { area: number; x: number }[]): boolean {
    // 检查x坐标是否大致呈现渐变趋势
    const xPositions = areas.map((a) => a.x);
    let increasingCount = 0;
    let decreasingCount = 0;

    for (let i = 1; i < xPositions.length; i++) {
      if (xPositions[i] > xPositions[i - 1]) {
        increasingCount++;
      } else if (xPositions[i] < xPositions[i - 1]) {
        decreasingCount++;
      }
    }

    const totalComparisons = xPositions.length - 1;
    return (
      increasingCount >= totalComparisons * 0.6 ||
      decreasingCount >= totalComparisons * 0.6
    );
  }

  // 计算渐变方向的一致性
  private calculateDirectionConsistency(ratios: number[]): number {
    if (ratios.length === 0) return 0;

    let increasingCount = 0;
    let decreasingCount = 0;

    for (let i = 1; i < ratios.length; i++) {
      if (ratios[i] > ratios[i - 1]) {
        increasingCount++;
      } else if (ratios[i] < ratios[i - 1]) {
        decreasingCount++;
      }
    }

    const maxDirection = Math.max(increasingCount, decreasingCount);
    return maxDirection / (ratios.length - 1);
  }

  private detectHierarchicalPattern(layout: Record<number, Rectangle>): {
    isHierarchical: boolean;
    hierarchyQuality: number;
  } {
    const yPositions = Array.from(
      new Set(Object.values(layout).map((r) => r.y)),
    ).sort((a, b) => a - b);

    const levelCount = yPositions.length;
    const rectangleCount = Object.keys(layout).length;
    const isHierarchical = levelCount >= 2 && levelCount <= rectangleCount / 2;

    if (!isHierarchical) {
      return { isHierarchical: false, hierarchyQuality: 0 };
    }

    // Calculate level distribution quality
    const levelSizes = yPositions.map(
      (y) => Object.values(layout).filter((r) => r.y === y).length,
    );

    let qualityScore = 0;
    for (let i = 1; i < levelSizes.length; i++) {
      const ratio = levelSizes[i] / levelSizes[i - 1];
      // Prefer ratios between 0.4 and 0.6 (ideal hierarchy)
      if (ratio >= 0.4 && ratio <= 0.6) {
        qualityScore++;
      }
    }

    const hierarchyQuality = qualityScore / (levelSizes.length - 1);

    return { isHierarchical, hierarchyQuality };
  }

  private detectAlignmentPattern(layout: Record<number, Rectangle>): {
    isAligned: boolean;
    alignmentQuality: number;
  } {
    const rectangles = Object.values(layout);

    // Check horizontal alignment
    const yPositions = new Set(rectangles.map((r) => r.y + r.length / 2));
    const horizontallyAligned = yPositions.size <= rectangles.length / 2;

    // Check vertical alignment
    const xPositions = new Set(rectangles.map((r) => r.x + r.width / 2));
    const verticallyAligned = xPositions.size <= rectangles.length / 2;

    const isAligned = horizontallyAligned || verticallyAligned;

    if (!isAligned) {
      return { isAligned: false, alignmentQuality: 0 };
    }

    // Calculate alignment quality
    let alignmentQuality;
    if (horizontallyAligned) {
      const positions = Array.from(yPositions);
      const avgSpacing =
        positions.reduce(
          (sum, pos, i, arr) =>
            i > 0 ? sum + Math.abs(pos - arr[i - 1]) : sum,
          0,
        ) /
        (positions.length - 1);

      const variance =
        positions.reduce(
          (sum, pos, i, arr) =>
            i > 0
              ? sum + Math.pow(Math.abs(pos - arr[i - 1]) - avgSpacing, 2)
              : sum,
          0,
        ) /
        (positions.length - 1);

      alignmentQuality = 1 - Math.min(1, variance / (avgSpacing * avgSpacing));
    } else {
      const positions = Array.from(xPositions);
      const avgSpacing =
        positions.reduce(
          (sum, pos, i, arr) =>
            i > 0 ? sum + Math.abs(pos - arr[i - 1]) : sum,
          0,
        ) /
        (positions.length - 1);

      const variance =
        positions.reduce(
          (sum, pos, i, arr) =>
            i > 0
              ? sum + Math.pow(Math.abs(pos - arr[i - 1]) - avgSpacing, 2)
              : sum,
          0,
        ) /
        (positions.length - 1);

      alignmentQuality = 1 - Math.min(1, variance / (avgSpacing * avgSpacing));
    }

    return { isAligned, alignmentQuality };
  }

  // 辅助函数：检测垂直主导布局
  private isVerticallyDominant(elements: MassElement[]): boolean {
    const ySpread =
      Math.max(...elements.map((e) => e.y)) -
      Math.min(...elements.map((e) => e.y));
    const xSpread =
      Math.max(...elements.map((e) => e.x)) -
      Math.min(...elements.map((e) => e.x));
    return ySpread > xSpread * 1.5;
  }

  // 辅助函数：检测水平主导布局
  private isHorizontallyDominant(elements: MassElement[]): boolean {
    const ySpread =
      Math.max(...elements.map((e) => e.y)) -
      Math.min(...elements.map((e) => e.y));
    const xSpread =
      Math.max(...elements.map((e) => e.x)) -
      Math.min(...elements.map((e) => e.x));
    return xSpread > ySpread * 1.5;
  }

  // 辅助函数：检测尺寸渐变
  private hasSizeGradient(elements: MassElement[]): boolean {
    const areas = elements.map((e) => e.width * e.length).sort((a, b) => b - a);
    for (let i = 1; i < areas.length; i++) {
      const ratio = areas[i] / areas[i - 1];
      if (ratio < 0.3 || ratio > 0.9) return false;
    }
    return true;
  }
}
