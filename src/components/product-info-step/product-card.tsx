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
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import type { ProductInfo } from "@/types/user-guide/product";
import { useState } from "react";

interface ProductCardProps {
  product: ProductInfo;
  onChange: (data: Partial<ProductInfo>) => void;
}

export function ProductCard({ product, onChange }: ProductCardProps) {
  const [quantityInput, setQuantityInput] = useState(
    product.quantity.toString(),
  );

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setQuantityInput(value);
    }
  };

  const handleQuantityBlur = () => {
    const newQuantity = parseInt(quantityInput, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onChange({ quantity: newQuantity });
    } else {
      onChange({ quantity: 1 });
      setQuantityInput("1");
    }
  };

  const handleQuantityDecrease = () => {
    if (product.quantity > 1) {
      const newQuantity = product.quantity - 1;
      onChange({ quantity: newQuantity });
      setQuantityInput(newQuantity.toString());
    }
  };

  const handleQuantityIncrease = () => {
    const newQuantity = product.quantity + 1;
    onChange({ quantity: newQuantity });
    setQuantityInput(newQuantity.toString());
  };

  return (
    <Card className="p-6">
      <div className="flex w-full">
        {/* 左侧：图片和尺寸信息 */}
        <div className="w-1/2 pr-4">
          {/* 图片容器 */}
          <div className="mb-6">
            <div className="max-w-[240px] mx-auto">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                {product.image && (
                  <Image
                    src={URL.createObjectURL(product.image.file)}
                    alt={product.fileName}
                    fill
                    sizes="(max-width: 240px) 100vw, 240px"
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </div>
          </div>

          {/* 尺寸显示 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>深度 (mm)</Label>
              <Input
                type="number"
                value={product.depth}
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

        {/* 右侧：材料、颜色和数量 */}
        <div className="w-1/2 pl-4 space-y-6">
          {/* 材料选择 */}
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

          {/* 颜色输入 */}
          <div>
            <Label>颜色</Label>
            <Input
              type="text"
              placeholder="请输入颜色"
              value={product.color}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </div>

          {/* 数量控制 */}
          <div>
            <Label>数量</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleQuantityDecrease}
                disabled={product.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={quantityInput}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleQuantityIncrease}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
