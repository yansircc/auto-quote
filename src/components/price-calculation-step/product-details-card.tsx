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
    <Card className="p-6">
      <div className="flex items-start gap-6">
        {/* 产品图片 */}
        <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-muted">
          {product.image && (
            <Image
              src={URL.createObjectURL(product.image.file)}
              alt={product.fileName}
              fill
              className="object-contain"
            />
          )}
        </div>

        {/* 产品信息 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">{product.fileName}</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">材料</p>
              <p className="capitalize">{product.material || "未指定"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">颜色</p>
              <p>{product.color || "未指定"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">尺寸 (mm)</p>
              <p>
                {product.width} × {product.height} × {product.depth}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">体积 (mm³)</p>
              <p>{volume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">重量 (g)</p>
              <p>{weight}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">数量</p>
              <p>{product.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">单件费用</p>
              <p>${(costs.totalCost / product.quantity).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总费用</p>
              <p className="font-semibold text-primary">
                ${costs.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
