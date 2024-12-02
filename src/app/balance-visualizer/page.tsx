"use client";

import { useState } from "react";
import { BalanceAnalyzer } from "@/components/BalanceAnalyzer";
import { ProductViewer } from "@/components/ProductViewer";
import { generateRandomProducts } from "@/lib/utils/product-generator";
import { calculateMinArea } from "@/lib/algorithm/min-area";
import { calculateInjectionPoint } from "@/lib/algorithm/balance/utils/geometry";
import type { Rectangle, Rectangle2D } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const scoreTooltips = {
  geometry: {
    title: "几何平衡分数",
    description:
      "评估产品在模具中的几何分布是否均匀。高分表示产品布局对称、重心分布合理，这有助于：\n• 模具填充时的压力均衡\n• 减少模具变形风险\n• 提高产品质量稳定性",
  },
  flow: {
    title: "流动平衡分数",
    description:
      "评估熔融材料从注塑点到各产品的流动路径是否均衡。高分表示流长相近，这有助于：\n• 保证各产品填充同步性\n• 减少翘曲和缩水\n• 提高尺寸精度",
  },
  distribution: {
    title: "分布平衡分数",
    description:
      "评估产品在模具中的整体分布状况。高分表示产品排布紧凑、间距合理，这有助于：\n• 优化冷却效果\n• 减少模具尺寸\n• 提高生产效率",
  },
};

export default function BalanceVisualizerPage() {
  const [productCount, setProductCount] = useState<number>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [layout, setLayout] = useState<Rectangle[] | null>(null);

  // 生成新的随机产品并计算布局
  const handleGenerateProducts = () => {
    const newProducts = generateRandomProducts(productCount);

    // 1. 将产品转换为 Rectangle2D 数组
    const rectangles: Rectangle2D[] = newProducts.map((product) => ({
      width: product.dimensions?.width ?? 0,
      length: product.dimensions?.length ?? 0,
    }));

    // 2. 计算最小面积布局
    const layoutResult = calculateMinArea(rectangles);

    // 3. 将布局结果转换为 Rectangle 数组
    const transformedLayout = layoutResult.layout.map(
      (rect): Rectangle => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        length: rect.length,
      }),
    );

    setProducts(newProducts);
    setLayout(transformedLayout);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 text-2xl font-bold">模具布局平衡分析</h1>
          <p className="mb-8 text-gray-600">
            通过几何平衡、流动分析和分布平衡多个维度评估模具布局的合理性
          </p>

          <div className="mb-6 flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="10"
              value={productCount}
              onChange={(e) =>
                setProductCount(
                  Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                )
              }
              className="w-20 rounded-md border px-3 py-2"
            />
            <button
              onClick={handleGenerateProducts}
              className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              生成随机产品
            </button>
          </div>

          {/* 产品布局视图 */}
          {products.length > 0 && layout && (
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">产品布局</h2>
              <ProductViewer products={products} layout={layout} />
            </div>
          )}

          {/* 布局分析区域 */}
          <div className="container mx-auto py-8">
            {products.length > 0 && layout ? (
              <TooltipProvider>
                <BalanceAnalyzer
                  products={products}
                  layout={layout}
                  injectionPoint={calculateInjectionPoint(layout)}
                  renderScore={(type, score) => (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{score.toFixed(1)}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <h3 className="font-semibold">
                            {scoreTooltips[type]?.title}
                          </h3>
                          <p className="whitespace-pre-line text-sm">
                            {scoreTooltips[type]?.description}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                />
              </TooltipProvider>
            ) : (
              <div className="text-center text-gray-500">
                请点击&quot;生成随机产品&quot;按钮开始分析
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
