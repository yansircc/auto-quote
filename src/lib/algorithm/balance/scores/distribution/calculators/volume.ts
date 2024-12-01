import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";

interface VolumeResult {
  score: number;
  details: {
    densityVariance: number;
    heightBalance: number;
    massDistribution: number;
    symmetry: number;
  };
}

export class VolumeCalculator {
  constructor() {
    this.calculate = this.calculate.bind(this);
  }

  calculate(
    layout: Record<number, Rectangle>,
    products: Product[],
  ): VolumeResult {
    // Handle empty or single product case
    if (products.length <= 1) {
      return {
        score: 100,
        details: {
          densityVariance: 100,
          heightBalance: 100,
          massDistribution: 100,
          symmetry: 100,
        },
      };
    }

    // Calculate volume metrics
    const volumes = products.map((p) =>
      p.dimensions
        ? p.dimensions.width * p.dimensions.length * p.dimensions.height
        : 0,
    );
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    const avgVolume = totalVolume / products.length;

    // Calculate volume variance with moderate scoring
    const volumeVariance =
      volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) /
      products.length;
    const normalizedVariance = Math.max(
      0,
      Math.min(100, 100 - (volumeVariance / (avgVolume * avgVolume)) * 120),
    );

    // Calculate height balance with moderate scoring
    const heights = products.map((p) => p.dimensions?.height ?? 0);
    const maxHeight = Math.max(...heights);
    const heightVariance =
      heights.reduce((sum, h) => sum + Math.pow(h - maxHeight, 2), 0) /
      products.length;
    const heightBalance = Math.max(
      0,
      Math.min(100, 100 - (heightVariance / (maxHeight * maxHeight)) * 120),
    );

    // Calculate mass distribution with moderate scoring
    const masses = products.map((p) => p.weight ?? 1);
    const totalMass = masses.reduce((sum, m) => sum + m, 0);
    const avgMass = totalMass / products.length;
    const massVariance =
      masses.reduce((sum, m) => sum + Math.pow(m - avgMass, 2), 0) /
      products.length;
    const massDistribution = Math.max(
      0,
      Math.min(100, 100 - (massVariance / (avgMass * avgMass)) * 120),
    );

    // Calculate symmetry with moderate scoring
    const symmetryScore = this.calculateSymmetry(layout);

    // Adjust weights to be more balanced
    const weights = {
      densityVariance: 0.35,
      heightBalance: 0.15,
      massDistribution: 0.35,
      symmetry: 0.15,
    };

    const details = {
      densityVariance: normalizedVariance,
      heightBalance,
      massDistribution,
      symmetry: symmetryScore,
    };

    const score = Object.entries(weights).reduce(
      (sum, [key, weight]) =>
        sum + details[key as keyof typeof details] * weight,
      0,
    );

    // Apply moderate penalty
    return {
      score: Math.min(100, score * 0.95),
      details,
    };
  }

  private calculateSymmetry(layout: Record<number, Rectangle>): number {
    const rectangles = Object.values(layout);
    if (rectangles.length <= 1) return 100;

    // Find center and bounds
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;
    let totalArea = 0;

    rectangles.forEach((rect) => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.length);
      totalArea += rect.width * rect.length;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const layoutWidth = maxX - minX;
    const layoutLength = maxY - minY;
    const maxRadius =
      Math.sqrt(layoutWidth * layoutWidth + layoutLength * layoutLength) / 2;

    // Calculate pattern-specific metrics with improved detection
    const { isVerticallyAligned, verticalQuality } =
      this.checkVerticalAlignment(rectangles);
    const { isHorizontallyAligned, horizontalQuality } =
      this.checkHorizontalAlignment(rectangles);
    const { isGradient, gradientQuality } = this.checkSizeGradient(rectangles);
    const { isHierarchical, hierarchyQuality } =
      this.checkHierarchicalLevels(rectangles);

    // Calculate axial symmetry with improved pattern-specific weights
    let axialAsymmetry = 0;
    rectangles.forEach((rect1) => {
      const axes = [
        {
          flip: (x: number, y: number) => [2 * centerX - x, y],
          weight: isHorizontallyAligned ? 0.8 + horizontalQuality * 0.2 : 0.5,
        },
        {
          flip: (x: number, y: number) => [x, 2 * centerY - y],
          weight: isVerticallyAligned ? 0.8 + verticalQuality * 0.2 : 0.5,
        },
      ];

      const rect1Center = {
        x: rect1.x + rect1.width / 2,
        y: rect1.y + rect1.length / 2,
      };

      axes.forEach((axis) => {
        const [mirrorX, mirrorY] = axis.flip(rect1Center.x, rect1Center.y);
        let minAsymmetry = Infinity;

        rectangles.forEach((rect2) => {
          if (rect2 === rect1) return;

          const rect2Center = {
            x: rect2.x + rect2.width / 2,
            y: rect2.y + rect2.length / 2,
          };

          // Calculate distance with improved pattern-specific tolerance
          const dist = Math.sqrt(
            Math.pow(rect2Center.x - mirrorX, 2) +
              Math.pow(rect2Center.y - mirrorY, 2),
          );

          // Calculate size difference with improved pattern-specific tolerance
          const sizeDiff =
            Math.abs(rect1.width * rect1.length - rect2.width * rect2.length) /
            (rect1.width * rect1.length);

          // Adjust asymmetry calculation with improved pattern handling
          let asymmetry;
          if (isGradient) {
            // For gradient layouts, more lenient size difference based on quality
            const distWeight = 0.95 - gradientQuality * 0.25; // 0.7-0.95
            asymmetry =
              (dist / maxRadius) * distWeight + sizeDiff * (1 - distWeight);
          } else if (isHierarchical) {
            // For hierarchical layouts, focus more on position based on quality
            const distWeight = 0.98 - hierarchyQuality * 0.18; // 0.8-0.98
            asymmetry =
              (dist / maxRadius) * distWeight + sizeDiff * (1 - distWeight);
          } else {
            // Default weights with slight improvement
            asymmetry = (dist / maxRadius) * 0.75 + sizeDiff * 0.25;
          }

          minAsymmetry = Math.min(minAsymmetry, asymmetry);
        });

        axialAsymmetry += minAsymmetry * axis.weight;
      });
    });

    // Normalize axial asymmetry with improved pattern-specific scaling
    let axialScore = 100 * (1 - axialAsymmetry / (2 * rectangles.length));

    // Apply improved pattern-specific bonuses to axial score
    if (isGradient) {
      axialScore *= 1 + gradientQuality * 0.25; // Up to 25% bonus
    }
    if (isHierarchical) {
      axialScore *= 1 + hierarchyQuality * 0.25; // Up to 25% bonus
    }

    // Calculate radial distribution with improved pattern-specific weights
    const angles = rectangles.map((rect) => {
      const x = rect.x + rect.width / 2 - centerX;
      const y = rect.y + rect.length / 2 - centerY;
      return Math.atan2(y, x);
    });

    // Calculate angular spacing score with improved pattern adjustments
    angles.sort((a, b) => a - b);
    const idealGap = (2 * Math.PI) / rectangles.length;
    let angleVariance = 0;

    for (let i = 0; i < angles.length; i++) {
      const j = (i + 1) % angles.length;
      let gap = angles[j] - angles[i];
      if (gap < 0) gap += 2 * Math.PI;

      // Adjust gap importance with improved pattern handling
      let gapWeight;
      if (isHierarchical) {
        gapWeight = 0.35 + hierarchyQuality * 0.25; // 0.35-0.6 based on quality
      } else if (isGradient) {
        gapWeight = 0.55 + gradientQuality * 0.25; // 0.55-0.8 based on quality
      } else {
        gapWeight = 1.0;
      }
      angleVariance += Math.pow(gap - idealGap, 2) * gapWeight;
    }

    let radialScore = 100 * (1 - Math.sqrt(angleVariance) / (2 * Math.PI));

    // Apply improved pattern-specific bonuses to radial score
    if (isGradient || isHierarchical) {
      radialScore *= 1.15; // 15% bonus for recognized patterns
    }

    // Calculate distance from center score with improved pattern adjustments
    let distanceVariance = 0;
    rectangles.forEach((rect) => {
      const x = rect.x + rect.width / 2 - centerX;
      const y = rect.y + rect.length / 2 - centerY;
      const distance = Math.sqrt(x * x + y * y);

      // Adjust ideal distance with improved pattern handling
      let idealDistance;
      if (isHierarchical) {
        idealDistance = maxRadius * (0.55 + hierarchyQuality * 0.25); // 0.55-0.8 based on quality
      } else if (isGradient) {
        idealDistance = maxRadius * (0.35 + gradientQuality * 0.25); // 0.35-0.6 based on quality
      } else {
        idealDistance = maxRadius * 0.5;
      }

      distanceVariance += Math.pow(distance - idealDistance, 2);
    });

    let distanceScore =
      100 * (1 - Math.sqrt(distanceVariance) / (maxRadius * rectangles.length));

    // Apply improved pattern-specific bonuses to distance score
    if (isGradient || isHierarchical) {
      distanceScore *= 1.15; // 15% bonus for recognized patterns
    }

    // Combine scores with improved pattern-specific weights
    let finalScore;
    if (isGradient) {
      // For gradient layouts, improved focus on axial symmetry
      const axialWeight = 0.45 + gradientQuality * 0.25; // 0.45-0.7 based on quality
      finalScore =
        axialScore * axialWeight +
        radialScore * ((1 - axialWeight) * 0.6) +
        distanceScore * ((1 - axialWeight) * 0.4);
    } else if (isHierarchical) {
      // For hierarchical layouts, improved balance
      const axialWeight = 0.35 + hierarchyQuality * 0.25; // 0.35-0.6 based on quality
      finalScore =
        axialScore * axialWeight +
        radialScore * ((1 - axialWeight) * 0.4) +
        distanceScore * ((1 - axialWeight) * 0.6);
    } else {
      // Improved default weights
      finalScore = axialScore * 0.45 + radialScore * 0.3 + distanceScore * 0.25;
    }

    // Apply improved alignment bonus
    if (isVerticallyAligned || isHorizontallyAligned) {
      finalScore *= 1.2; // 20% bonus for good alignment
    }

    // Apply improved minimum score for recognized patterns
    if (isGradient || isHierarchical) {
      finalScore = Math.max(finalScore, 72); // Ensure higher minimum score
    }

    // Apply final quality boost
    const qualityBoost = Math.max(
      gradientQuality || 0,
      hierarchyQuality || 0,
      verticalQuality || 0,
      horizontalQuality || 0,
    );
    finalScore *= 1 + qualityBoost * 0.1; // Up to 10% additional boost based on best quality

    return Math.max(0, Math.min(100, finalScore));
  }

  private checkVerticalAlignment(rectangles: Rectangle[]): {
    isVerticallyAligned: boolean;
    verticalQuality: number;
  } {
    const xPositions = rectangles.map((r) => r.x + r.width / 2);
    const uniquePositions = new Set(xPositions);
    const isVerticallyAligned = uniquePositions.size <= rectangles.length / 2;

    if (!isVerticallyAligned) {
      return { isVerticallyAligned: false, verticalQuality: 0 };
    }

    // Calculate alignment quality based on position variance
    const positions = Array.from(uniquePositions);
    const avgSpacing =
      positions.reduce(
        (sum, pos, i, arr) => (i > 0 ? sum + Math.abs(pos - arr[i - 1]) : sum),
        0,
      ) /
      (positions.length - 1);

    const spacingVariance =
      positions.reduce(
        (sum, pos, i, arr) =>
          i > 0
            ? sum + Math.pow(Math.abs(pos - arr[i - 1]) - avgSpacing, 2)
            : sum,
        0,
      ) /
      (positions.length - 1);

    const verticalQuality =
      1 - Math.min(1, spacingVariance / (avgSpacing * avgSpacing));

    return { isVerticallyAligned, verticalQuality };
  }

  private checkHorizontalAlignment(rectangles: Rectangle[]): {
    isHorizontallyAligned: boolean;
    horizontalQuality: number;
  } {
    const yPositions = rectangles.map((r) => r.y + r.length / 2);
    const uniquePositions = new Set(yPositions);
    const isHorizontallyAligned = uniquePositions.size <= rectangles.length / 2;

    if (!isHorizontallyAligned) {
      return { isHorizontallyAligned: false, horizontalQuality: 0 };
    }

    // Calculate alignment quality based on position variance
    const positions = Array.from(uniquePositions);
    const avgSpacing =
      positions.reduce(
        (sum, pos, i, arr) => (i > 0 ? sum + Math.abs(pos - arr[i - 1]) : sum),
        0,
      ) /
      (positions.length - 1);

    const spacingVariance =
      positions.reduce(
        (sum, pos, i, arr) =>
          i > 0
            ? sum + Math.pow(Math.abs(pos - arr[i - 1]) - avgSpacing, 2)
            : sum,
        0,
      ) /
      (positions.length - 1);

    const horizontalQuality =
      1 - Math.min(1, spacingVariance / (avgSpacing * avgSpacing));

    return { isHorizontallyAligned, horizontalQuality };
  }

  private checkSizeGradient(rectangles: Rectangle[]): {
    isGradient: boolean;
    gradientQuality: number;
  } {
    const areas = rectangles
      .map((r) => r.width * r.length)
      .sort((a, b) => b - a);
    let totalRatio = 0;
    let validSteps = 0;

    for (let i = 1; i < areas.length; i++) {
      const ratio = areas[i] / areas[i - 1];
      if (ratio >= 0.3 && ratio <= 0.9) {
        totalRatio += ratio;
        validSteps++;
      }
    }

    const isGradient = validSteps === areas.length - 1;

    // Improved gradient quality calculation
    let gradientQuality = 0;
    if (isGradient) {
      const avgRatio = totalRatio / validSteps;
      // Prefer ratios closer to 0.6 (ideal gradient)
      gradientQuality = 1 - Math.abs(avgRatio - 0.6) / 0.3;
    }

    return { isGradient, gradientQuality };
  }

  private checkHierarchicalLevels(rectangles: Rectangle[]): {
    isHierarchical: boolean;
    hierarchyQuality: number;
  } {
    const yPositions = Array.from(new Set(rectangles.map((r) => r.y)));
    const levelCount = yPositions.size;
    const isHierarchical =
      levelCount >= 2 && levelCount <= rectangles.length / 2;

    if (!isHierarchical) {
      return { isHierarchical: false, hierarchyQuality: 0 };
    }

    // Calculate level balance with improved metrics
    yPositions.sort((a, b) => a - b);
    const levelSizes = yPositions.map(
      (y) => rectangles.filter((r) => r.y === y).length,
    );

    // Calculate level spacing quality
    const levelSpacings = yPositions.slice(1).map((y, i) => y - yPositions[i]);
    const avgSpacing =
      levelSpacings.reduce((sum, s) => sum + s, 0) / levelSpacings.length;
    const spacingVariance =
      levelSpacings.reduce((sum, s) => sum + Math.pow(s - avgSpacing, 2), 0) /
      levelSpacings.length;
    const spacingQuality =
      1 - Math.min(1, spacingVariance / (avgSpacing * avgSpacing));

    // Calculate size distribution quality
    let sizeQuality = 0;
    for (let i = 1; i < levelSizes.length; i++) {
      const ratio = levelSizes[i] / levelSizes[i - 1];
      // Prefer ratios between 0.4 and 0.6 (ideal hierarchy)
      if (ratio >= 0.4 && ratio <= 0.6) {
        sizeQuality++;
      }
    }
    sizeQuality /= levelSizes.length - 1;

    // Combine spacing and size quality
    const hierarchyQuality = spacingQuality * 0.4 + sizeQuality * 0.6;

    return { isHierarchical, hierarchyQuality };
  }
}
