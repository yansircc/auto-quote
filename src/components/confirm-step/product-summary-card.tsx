"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { ProductInfo } from "@/types/user-guide/product";

interface ProductSummaryCardProps {
  product: ProductInfo;
  index: number;
}

export function ProductSummaryCard({
  product,
  index,
}: ProductSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* 左侧：图片 */}
        <div className="w-[120px]">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            {product.image && (
              <Image
                src={URL.createObjectURL(product.image.file)}
                alt={`Product ${index + 1}`}
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>

        {/* 右侧：产品信息 */}
        <div className="flex-1">
          <h3 className="font-semibold mb-4">产品 {index + 1}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">材料</p>
              <p>{product.material}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">颜色</p>
              <p>{product.color}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">数量</p>
              <p>{product.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">尺寸 (mm)</p>
              <p>
                {product.depth} × {product.width} × {product.height}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
