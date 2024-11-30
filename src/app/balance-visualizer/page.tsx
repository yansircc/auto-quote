"use client";

import { useState } from 'react';
import { BalanceAnalyzer } from '@/components/BalanceAnalyzer';
import { ProductViewer } from '@/components/ProductViewer';
import { generateRandomProducts } from '@/lib/utils/product-generator';
import { calculateMinArea } from '@/lib/algorithm/min-area';
import { calculateInjectionPoint } from '@/lib/algorithm/balance/utils/geometry';
import type { Product, Rectangle } from '@/types/geometry';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const scoreTooltips = {
  geometry: {
    title: "几何平衡分数",
    description: "评估产品在模具中的几何分布是否均匀。高分表示产品布局对称、重心分布合理，这有助于：\n• 模具填充时的压力均衡\n• 减少模具变形风险\n• 提高产品质量稳定性"
  },
  flow: {
    title: "流动平衡分数",
    description: "评估熔融材料从注塑点到各产品的流动路径是否均衡。高分表示流长相近，这有助于：\n• 保证各产品填充同步性\n• 减少翘曲和缩水\n• 提高尺寸精度"
  },
  volume: {
    title: "体积利用分数",
    description: "评估产品在模具空间中的体积利用率。高分表示空间利用率高，产品体积分布合理，这有助于：\n• 降低模具成本\n• 提高生产效率\n• 节约材料使用"
  },
  distribution: {
    title: "分布平衡分数",
    description: "评估产品在模具中的整体分布状况。高分表示产品排布紧凑、间距合理，这有助于：\n• 优化冷却效果\n• 减少模具尺寸\n• 提高生产效率"
  }
};

export default function BalanceVisualizerPage() {
  const [productCount, setProductCount] = useState<number>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [layout, setLayout] = useState<Rectangle[] | null>(null);

  // 生成新的随机产品并计算布局
  const handleGenerateProducts = () => {
    const newProducts = generateRandomProducts(productCount);
    const layoutResult = calculateMinArea(newProducts);
    
    // Transform layout result to Rectangle array
    // 将布局结果转换为Rectangle数组
    const transformedLayout = layoutResult.layout.map((rect): Rectangle => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      rotated: rect.rotated ?? false,
      originalIndex: rect.originalIndex
    }));
    
    setProducts(newProducts);
    setLayout(transformedLayout);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">模具布局平衡分析</h1>
          <p className="text-gray-600 mb-8">
            通过几何平衡、流动分析和分布平衡多个维度评估模具布局的合理性
          </p>
          
          <div className="mb-6 flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="10"
              value={productCount}
              onChange={(e) => setProductCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleGenerateProducts}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              生成随机产品
            </button>
          </div>

          {/* 产品布局视图 */}
          {products.length > 0 && layout && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">产品布局</h2>
              <ProductViewer products={products} layout={layout} />
            </div>
          )}

          {/* 产品列表 */}
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <ProductViewer key={product.id} product={product} />
            ))}
          </div>

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
                        <span className="cursor-help">{score}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{scoreTooltips[type]?.title}</h3>
                          <p className="text-sm whitespace-pre-line">{scoreTooltips[type]?.description}</p>
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
