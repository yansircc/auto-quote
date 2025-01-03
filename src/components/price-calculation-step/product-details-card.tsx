"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { ProductInfo } from "@/types/user-guide/product";

interface ProductCosts {
  materialCost: number;
  processingFee: number;
  totalCost: number;
}

interface ProductDetailsCardProps {
  product: ProductInfo;
  costs: ProductCosts;
}

export function ProductDetailsCard({
  product,
  costs,
}: ProductDetailsCardProps) {
  // 计算体积 (立方毫米)
  const volume = product.width * product.height * product.depth;
  // 计算重量 (克)，假设密度为 1.25g/cm³
  const weight = Number(((volume / 1000) * 1.25).toFixed(2));

  return (
    <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-6">
        {/* 产品图片 */}
        <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
          {product.image && (
            <Image
              src={URL.createObjectURL(product.image.file)}
              alt={product.fileName}
              fill
              className="object-contain p-2"
            />
          )}
        </div>

        {/* 产品信息 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {product.fileName}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">材料</p>
              <p className="font-medium text-gray-700 capitalize">
                {product.material || "未指定"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">颜色</p>
              <p className="font-medium text-gray-700">
                {product.color || "未指定"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">尺寸 (mm)</p>
              <p className="font-medium text-gray-700">
                {product.depth} × {product.width} × {product.height}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">体积 (mm³)</p>
              <p className="font-medium text-gray-700">
                {volume.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">重量 (g)</p>
              <p className="font-medium text-gray-700">{weight}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">数量</p>
              <p className="font-medium text-gray-700">{product.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">单件费用</p>
              <p className="font-medium text-blue-600">
                ${(costs.totalCost / product.quantity).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总费用</p>
              <p className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                ${costs.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
