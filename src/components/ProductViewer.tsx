'use client';

import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Scene } from './Scene';
import type { Product, Rectangle } from '@/types/geometry';

interface ProductViewerProps {
  product?: Product;
  products?: Product[];
  layout?: Rectangle[];
}

// 格式化数字，保留2位小数
function formatNumber(num: number): string {
  return num.toFixed(2);
}

export function ProductViewer({ product, products, layout }: ProductViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 如果提供了单个产品，就显示单个产品视图
  if (product) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3D视图 */}
          <div className="h-[300px] bg-gray-50 rounded-lg overflow-hidden">
            <Scene 
              product={product}
              products={[product]}
              layout={[{
                x: 0,
                y: 0,
                width: product.dimensions?.length ?? 0,
                height: product.dimensions?.width ?? 0,
                rotated: false,
                originalIndex: 0
              }]}
            />
          </div>

          {/* 产品信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">产品 #{product.id}</h3>
            
            {/* 基本信息 */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">基本信息</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>重量：</div>
                <div>{product.weight}g</div>
                {product.dimensions && (
                  <>
                    <div>尺寸：</div>
                    <div>
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} mm
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 详细信息（可折叠） */}
            <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
              <Collapsible.Trigger className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                <span className="mr-1">{isOpen ? '收起' : '展开'}详细信息</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Collapsible.Trigger>
              
              <Collapsible.Content className="mt-4">
                {product.cadData && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>体积：</div>
                    <div>{formatNumber(product.cadData.volume)} mm³</div>
                    <div>表面积：</div>
                    <div>{formatNumber(product.cadData.surfaceArea)} mm²</div>
                    <div>质心位置：</div>
                    <div>
                      ({formatNumber(product.cadData.centerOfMass.x)},
                      {formatNumber(product.cadData.centerOfMass.y)},
                      {formatNumber(product.cadData.centerOfMass.z)})
                    </div>
                  </div>
                )}
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
      </div>
    );
  }

  // 如果提供了多个产品和布局，就显示布局视图
  if (products && layout && products.length > 0 && layout.length > 0) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-slate-100">
        <Scene products={products} layout={layout} />
      </div>
    );
  }

  return null;
}
