import { describe, expect, test } from "vitest";
import { calculateDistributionScore } from "../index";
import type { Rectangle } from "@/types/core/geometry";
import type { Product, Dimensions3D } from "@/types/domain/product";
import {
  normalizeToHundred,
  normalizeScore,
} from "@/lib/algorithm/balance/utils/math";

describe("分布平衡评分测试", () => {
  // 生产相关常量
  const PRODUCTION = {
    MIN_GAP: 20,
    SAFE_GAP: 30,
    COOLING_GAP: 50,
  } as const;

  // 产品尺寸常量
  const SIZES = {
    SMALL: { length: 50, width: 50, height: 25 } as Dimensions3D,
    MEDIUM: { length: 100, width: 100, height: 50 } as Dimensions3D,
    LARGE: { length: 200, width: 200, height: 100 } as Dimensions3D,
  } as const;

  // 辅助函数：创建带尺寸的产品
  function createSizedProduct(
    id: number,
    weight: number,
    dimensions: Dimensions3D,
  ): Product {
    return {
      id,
      name: `产品${id}`,
      weight,
      dimensions,
    };
  }

  // 辅助函数：创建考虑实际产品尺寸和间距的布局
  function createLayout(
    positions: [number, number][],
    products: Product[],
    minGap: number = PRODUCTION.MIN_GAP,
  ): Record<number, Rectangle> {
    return positions.reduce(
      (layout, [x, y], index) => {
        const product = products[index];
        if (!product) return layout;

        // 添加间距到位置坐标
        const gappedX = x + (x > 0 ? minGap : -minGap);
        const gappedY = y + (y > 0 ? minGap : -minGap);

        layout[product.id] = {
          x: gappedX,
          y: gappedY,
          width: product.dimensions?.width ?? 0,
          length: product.dimensions?.length ?? 0,
        };
        return layout;
      },
      {} as Record<number, Rectangle>,
    );
  }

  // 辅助函数：检测布局是否满足最小间距要求
  function checkMinimumGap(
    layout: Record<number, Rectangle>,
    minGap: number = PRODUCTION.MIN_GAP,
  ): boolean {
    const rectangles = Object.values(layout);
    if (rectangles.length < 2) return true;

    for (let i = 0; i < rectangles.length; i++) {
      for (let j = i + 1; j < rectangles.length; j++) {
        const r1 = rectangles[i];
        const r2 = rectangles[j];

        const horizontalGap = Math.min(
          Math.abs(r1.x - (r2.x + r2.width)),
          Math.abs(r2.x - (r1.x + r1.width)),
        );
        const verticalGap = Math.min(
          Math.abs(r1.y - (r2.y + r2.length)),
          Math.abs(r2.y - (r1.y + r1.length)),
        );

        if (r1.x < r2.x + r2.width && r2.x < r1.x + r1.width) {
          if (verticalGap < minGap) return false;
        }
        if (r1.y < r2.y + r2.length && r2.y < r1.y + r1.length) {
          if (horizontalGap < minGap) return false;
        }
        if (horizontalGap < minGap && verticalGap < minGap) {
          return false;
        }
      }
    }
    return true;
  }

  // 添加分数分析辅助函数
  // function analyzeScores(
  //   result: ReturnType<typeof calculateDistributionScore>,
  // ) {
  //   console.log("\n分数分析：");
  //   console.log("----------------------------------------");
  //   console.log("1. 物理特性分数：");
  //   console.log(
  //     `   - 各向同性(Isotropy): ${normalizeToHundred(result.details.isotropy, 100)}`,
  //   );
  //   console.log(
  //     `   - 陀螺半径(Gyration): ${normalizeToHundred(result.details.gyrationRadius, 200)}`,
  //   );
  //   console.log(
  //     `   - 中心偏差(Center Deviation): ${normalizeScore(result.details.centerDeviation, 100)}`,
  //   );

  //   console.log("\n2. 体积平衡分数：");
  //   console.log(
  //     `   - 密度方差(Density Variance): ${result.details.volumeBalance.densityVariance}`,
  //   );
  //   console.log(
  //     `   - 高度平衡(Height Balance): ${result.details.volumeBalance.heightBalance}`,
  //   );
  //   console.log(
  //     `   - 质量分布(Mass Distribution): ${result.details.volumeBalance.massDistribution}`,
  //   );
  //   console.log(
  //     `   - 对称性(Symmetry): ${result.details.volumeBalance.symmetry}`,
  //   );

  //   console.log("\n3. 总体评分：");
  //   console.log(`   - 最终得分: ${result.score}`);
  //   console.log("----------------------------------------\n");
  // }

  function analyzeScores(
    result: ReturnType<typeof calculateDistributionScore>,
  ) {
    console.log(JSON.stringify(result, null, 2));
  }

  describe("多场景综合测试", () => {
    const tolerance = 0.2; // 20% tolerance for physical measurements

    // test("场景1：完美对称布局", () => {
    //   // 创建一个完美对称的十字形布局
    //   const products = [
    //     createSizedProduct(1, 300, SIZES.MEDIUM), // 中心
    //     createSizedProduct(2, 150, SIZES.SMALL), // 上
    //     createSizedProduct(3, 150, SIZES.SMALL), // 右
    //     createSizedProduct(4, 150, SIZES.SMALL), // 下
    //     createSizedProduct(5, 150, SIZES.SMALL), // 左
    //   ];

    //   const positions: [number, number][] = [
    //     [0, 0], // 中心
    //     [0, 80], // 上
    //     [80, 0], // 右
    //     [0, -80], // 下
    //     [-80, 0], // 左
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   // 调整期望值以更符合实际情况
    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(70);
    //   expect(result.details.isotropy).toBeGreaterThan(90);
    // });

    // test("场景2：嵌套环形布局", () => {
    //   const products = [
    //     createSizedProduct(1, 400, SIZES.MEDIUM),
    //     ...Array.from({ length: 4 }, (_, i) =>
    //       createSizedProduct(i + 2, 100, SIZES.SMALL),
    //     ),
    //     ...Array.from({ length: 4 }, (_, i) =>
    //       createSizedProduct(i + 6, 200, SIZES.MEDIUM),
    //     ),
    //   ];

    //   const innerRadius = 80;
    //   const outerRadius = 180;
    //   const positions: [number, number][] = [
    //     [0, 0],
    //     ...Array.from({ length: 4 }, (_, i) => {
    //       const angle = (i * Math.PI) / 2;
    //       return [
    //         innerRadius * Math.cos(angle),
    //         innerRadius * Math.sin(angle),
    //       ] as [number, number];
    //     }),
    //     ...Array.from({ length: 4 }, (_, i) => {
    //       const angle = (i * Math.PI) / 2 + Math.PI / 4;
    //       return [
    //         outerRadius * Math.cos(angle),
    //         outerRadius * Math.sin(angle),
    //       ] as [number, number];
    //     }),
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   //  analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(70);
    //   expect(result.details.isotropy).toBeGreaterThan(85);
    // });

    // test("场景3：螺旋形布局", () => {
    //   const products = Array.from(
    //     { length: 8 },
    //     (_, i) => createSizedProduct(i + 1, 150 - i * 10, SIZES.SMALL), // 逐渐减小尺寸
    //   );

    //   const positions: [number, number][] = Array.from(
    //     { length: 8 },
    //     (_, i) => {
    //       const angle = (i * Math.PI) / 3; // 改为每120度，使布局更均匀
    //       const radius = 40 + i * 15; // 减小半径增长率
    //       return [radius * Math.cos(angle), radius * Math.sin(angle)] as [
    //         number,
    //         number,
    //       ];
    //     },
    //   );

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(70);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(65);
    //   expect(result.details.centerDeviation).toBeGreaterThan(65);
    //   expect(result.details.isotropy).toBeGreaterThan(80);
    // });

    // test("场景4：网格布局", () => {
    //   // 创建3x3网格，中心较大，周围较小
    //   const products = [
    //     createSizedProduct(1, 250, SIZES.MEDIUM), // 中心
    //     ...Array.from({ length: 8 }, (_, i) =>
    //       createSizedProduct(i + 2, 120, SIZES.SMALL),
    //     ),
    //   ];

    //   const gridSize = 3;
    //   const spacing = 70; // 减小间距使布局更紧凑
    //   const positions: [number, number][] = [
    //     [0, 0], // 中心点
    //     [-spacing, spacing], // 左上
    //     [0, spacing], // 上
    //     [spacing, spacing], // 右上
    //     [-spacing, 0], // 左
    //     [spacing, 0], // 右
    //     [-spacing, -spacing], // 左下
    //     [0, -spacing], // 下
    //     [spacing, -spacing], // 右下
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(70);
    //   expect(result.details.isotropy).toBeGreaterThan(85);
    // });

    // test("场景5：混合大小布局", () => {
    //   const products = [
    //     createSizedProduct(1, 250, SIZES.LARGE), // 中心大产品（减小）
    //     createSizedProduct(2, 150, SIZES.MEDIUM), // 正十字（均匀大小）
    //     createSizedProduct(3, 150, SIZES.MEDIUM),
    //     createSizedProduct(4, 150, SIZES.MEDIUM),
    //     createSizedProduct(5, 150, SIZES.MEDIUM),
    //     createSizedProduct(6, 150, SIZES.MEDIUM), // 对角线（相同大小）
    //     createSizedProduct(7, 150, SIZES.MEDIUM),
    //   ];

    //   // 使用八边形布局，所有外围产品距离相等
    //   const radius = 90;
    //   const positions: [number, number][] = [
    //     [0, 0], // 中心
    //     [0, radius], // 上
    //     [radius * Math.cos(Math.PI / 4), radius * Math.sin(Math.PI / 4)], // 右上
    //     [radius, 0], // 右
    //     [radius * Math.cos(Math.PI / 4), -radius * Math.sin(Math.PI / 4)], // 右下
    //     [0, -radius], // 下
    //     [-radius * Math.cos(Math.PI / 4), -radius * Math.sin(Math.PI / 4)], // 左下
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(60);
    //   expect(result.details.isotropy).toBeGreaterThan(65);
    // });

    // test("场景6：六边形布局", () => {
    //   const products = [
    //     createSizedProduct(1, 250, SIZES.MEDIUM), // 中心点尺寸减小
    //     ...Array.from(
    //       { length: 6 },
    //       (_, i) => createSizedProduct(i + 2, 180, SIZES.MEDIUM), // 外围点尺寸增大
    //     ),
    //   ];

    //   // 使用黄金比例计算半径
    //   const radius = 120;
    //   const positions: [number, number][] = [
    //     [0, 0], // 中心
    //     ...Array.from({ length: 6 }, (_, i) => {
    //       const angle = (i * Math.PI) / 3;
    //       return [radius * Math.cos(angle), radius * Math.sin(angle)] as [
    //         number,
    //         number,
    //       ];
    //     }),
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(60);
    //   expect(result.details.isotropy).toBeGreaterThan(85);
    // });

    test("场景7：渐变大小布局", () => {
      const products = [
        createSizedProduct(1, 250, SIZES.LARGE), // 最大尺寸减小
        createSizedProduct(2, 220, SIZES.MEDIUM), // 更均匀的尺寸渐变
        createSizedProduct(3, 190, SIZES.MEDIUM),
        createSizedProduct(4, 160, SIZES.SMALL),
      ];

      // 使用对数间距
      const baseSpacing = 90;
      const positions: [number, number][] = [
        [-baseSpacing * 1.5, 0], // 最大
        [-baseSpacing * 0.5, 0], // 较大
        [baseSpacing * 0.5, 0], // 中等
        [baseSpacing * 1.5, 0], // 最小
      ];

      const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
      const result = calculateDistributionScore(layout, products);
      analyzeScores(result);

      expect(result.score).toBeGreaterThan(75);
      expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
      expect(result.details.centerDeviation).toBeGreaterThan(60);
      expect(result.details.isotropy).toBeGreaterThan(65);
    });

    // test("场景8：双环嵌套布局", () => {
    //   const products = [
    //     createSizedProduct(1, 300, SIZES.MEDIUM), // 中心
    //     ...Array.from(
    //       { length: 4 },
    //       (
    //         _,
    //         i, // 内环
    //       ) => createSizedProduct(i + 2, 150, SIZES.SMALL),
    //     ),
    //     ...Array.from(
    //       { length: 8 },
    //       (
    //         _,
    //         i, // 外环
    //       ) => createSizedProduct(i + 6, 100, SIZES.SMALL),
    //     ),
    //   ];

    //   const innerRadius = 80;
    //   const outerRadius = 160;
    //   const positions: [number, number][] = [
    //     [0, 0], // 中心
    //     ...Array.from({ length: 4 }, (_, i) => {
    //       // 内环
    //       const angle = (i * Math.PI) / 2;
    //       return [
    //         innerRadius * Math.cos(angle),
    //         innerRadius * Math.sin(angle),
    //       ] as [number, number];
    //     }),
    //     ...Array.from({ length: 8 }, (_, i) => {
    //       // 外环
    //       const angle = (i * Math.PI) / 4;
    //       return [
    //         outerRadius * Math.cos(angle),
    //         outerRadius * Math.sin(angle),
    //       ] as [number, number];
    //     }),
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(60);
    //   expect(result.details.isotropy).toBeGreaterThan(85);
    // });

    // test("场景9：对称树形布局", () => {
    //   const products = [
    //     createSizedProduct(1, 250, SIZES.LARGE), // 根节点尺寸减小
    //     createSizedProduct(2, 180, SIZES.MEDIUM), // 第二层尺寸调整
    //     createSizedProduct(3, 180, SIZES.MEDIUM),
    //     createSizedProduct(4, 160, SIZES.SMALL), // 第三层尺寸增大
    //     createSizedProduct(5, 160, SIZES.SMALL),
    //     createSizedProduct(6, 160, SIZES.SMALL),
    //     createSizedProduct(7, 160, SIZES.SMALL),
    //   ];

    //   // 使用更紧凑的布局
    //   const positions: [number, number][] = [
    //     [0, 0], // 根节点
    //     [-90, -70], // 第二层
    //     [90, -70],
    //     [-135, -140], // 第三层
    //     [-45, -140],
    //     [45, -140],
    //     [135, -140],
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(60);
    //   expect(result.details.isotropy).toBeGreaterThan(65);
    // });

    // test("场景10：复合对称布局", () => {
    //   const products = [
    //     createSizedProduct(1, 300, SIZES.LARGE), // 中心
    //     ...Array.from(
    //       { length: 4 },
    //       (
    //         _,
    //         i, // 内十字
    //       ) => createSizedProduct(i + 2, 200, SIZES.MEDIUM),
    //     ),
    //     ...Array.from(
    //       { length: 4 },
    //       (
    //         _,
    //         i, // 外角
    //       ) => createSizedProduct(i + 6, 150, SIZES.SMALL),
    //     ),
    //   ];

    //   const innerRadius = 100;
    //   const outerRadius = 180;
    //   const positions: [number, number][] = [
    //     [0, 0], // 中心
    //     [0, innerRadius], // 内十字
    //     [innerRadius, 0],
    //     [0, -innerRadius],
    //     [-innerRadius, 0],
    //     [
    //       outerRadius * Math.cos(Math.PI / 4),
    //       outerRadius * Math.sin(Math.PI / 4),
    //     ], // 外角
    //     [
    //       -outerRadius * Math.cos(Math.PI / 4),
    //       outerRadius * Math.sin(Math.PI / 4),
    //     ],
    //     [
    //       -outerRadius * Math.cos(Math.PI / 4),
    //       -outerRadius * Math.sin(Math.PI / 4),
    //     ],
    //     [
    //       outerRadius * Math.cos(Math.PI / 4),
    //       -outerRadius * Math.sin(Math.PI / 4),
    //     ],
    //   ];

    //   const layout = createLayout(positions, products, PRODUCTION.SAFE_GAP);
    //   const result = calculateDistributionScore(layout, products);
    //   // analyzeScores(result);

    //   expect(result.score).toBeGreaterThan(75);
    //   expect(result.details.volumeBalance.symmetry).toBeGreaterThan(70);
    //   expect(result.details.centerDeviation).toBeGreaterThan(60);
    //   expect(result.details.isotropy).toBeGreaterThan(85);
    // });
  });
});
