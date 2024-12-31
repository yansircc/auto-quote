"use client";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { ProductInfo } from "@/types/user-guide/product";

interface ProductCardProps {
  product: ProductInfo;
  onChange: (data: Partial<ProductInfo>) => void;
}

export function ProductCard({ product, onChange }: ProductCardProps) {
  return (
    <Card className="p-6">
      <div className="flex w-full">
        {/* 左侧：图片和尺寸信息 (50%) */}
        <div className="w-1/2 pr-4">
          {/* 图片容器 */}
          <div className="mb-6">
            <div className="max-w-[240px] mx-auto">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={URL.createObjectURL(product.image.file)}
                  alt={`Product ${product.id}`}
                  fill
                  sizes="(max-width: 240px) 100vw, 240px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* 尺寸显示 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>长度 (mm)</Label>
              <Input
                type="number"
                value={product.length}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>宽度 (mm)</Label>
              <Input
                type="number"
                value={product.width}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>高度 (mm)</Label>
              <Input
                type="number"
                value={product.height}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* 右侧：材料、颜色和数量 (50%) */}
        <div className="w-1/2 pl-4 space-y-6">
          <div>
            <Label>材料</Label>
            <Select
              value={product.material}
              onValueChange={(value) => onChange({ material: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择材料" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pla">PLA</SelectItem>
                <SelectItem value="abs">ABS</SelectItem>
                <SelectItem value="petg">PETG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>颜色</Label>
            <Select
              value={product.color}
              onValueChange={(value) => onChange({ color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择颜色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">白色</SelectItem>
                <SelectItem value="black">黑色</SelectItem>
                <SelectItem value="gray">灰色</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>数量</Label>
            <Input
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) => onChange({ quantity: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
