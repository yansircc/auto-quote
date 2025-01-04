"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { Product } from "@/lib/quote-price/product/types";

interface ProductSummaryCardProps {
  product: Product;
  index: number;
}

export function ProductSummaryCard({
  product,
  index,
}: ProductSummaryCardProps) {
  // 计算重量 (g) = 体积 (mm³) * 密度 (g/mm³)
  const weight = product.netVolume * product.material.density;

  return (
    <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex gap-6">
        {/* 左侧：图片 */}
        <div className="w-[120px]">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
            {product.image && (
              <Image
                src={URL.createObjectURL(product.image.file)}
                alt={`Product ${index + 1}`}
                fill
                className="object-contain p-2"
              />
            )}
          </div>
        </div>

        {/* 右侧：产品信息 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">
            产品 {index + 1}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">材料</p>
              <p className="text-gray-700">{product.material.name}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">颜色</p>
              <p className="text-gray-700">{product.color}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">数量</p>
              <p className="text-gray-700">{product.quantity}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">尺寸 (mm)</p>
              <p className="text-gray-700">
                {product.dimensions.width} × {product.dimensions.height} ×{" "}
                {product.dimensions.depth}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">体积 (mm³)</p>
              <p className="text-gray-700">
                {product.netVolume.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-500">重量 (g)</p>
              <p className="text-gray-700">{weight.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
