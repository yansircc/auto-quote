"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { ProductInfo } from "@/types/user-guide/product";

<<<<<<< HEAD
interface ProductCosts {
  materialCost: number;
  processingFee: number;
  totalCost: number;
}

interface ProductDetailsCardProps {
  product: ProductInfo;
  costs: ProductCosts;
=======
interface ProductDetailsCardProps {
  product: ProductInfo;
  costs: {
    materialCost: number;
    processingFee: number;
    totalCost: number;
  };
>>>>>>> upstream/main
}

export function ProductDetailsCard({
  product,
  costs,
}: ProductDetailsCardProps) {
<<<<<<< HEAD
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
=======
  const volume =
    (product.length ?? 0) * (product.width ?? 0) * (product.height ?? 0);
  const weight = (volume / 1000) * 1.25;

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* 左侧：产品图片 */}
        <div className="flex-shrink-0">
          <div className="w-[120px] h-[120px] relative rounded-lg overflow-hidden bg-muted">
            <Image
              src={URL.createObjectURL(product.image.file)}
              alt={`Product ${product.id}`}
              fill
              sizes="120px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 右侧：产品信息 */}
        <div className="flex-grow space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">产品详细信息</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">产品体积</p>
              <p className="text-xl font-semibold">
                {(volume / 1000).toFixed(2)} mm³
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">产品重量</p>
              <p className="text-xl font-semibold">{weight.toFixed(2)} g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">产品材料</p>
              <p className="text-xl font-semibold">
                {product.material?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">材料成本</p>
              <p className="text-xl font-semibold">
                ¥{costs.materialCost.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">加工费用</p>
              <p className="text-xl font-semibold">
                ${costs.processingFee.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">总费用</p>
              <p className="text-xl font-semibold">
                ${costs.totalCost.toFixed(2)}
>>>>>>> upstream/main
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
