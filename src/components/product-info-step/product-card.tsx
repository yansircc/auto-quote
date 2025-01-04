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
import type { Product } from "@/lib/quote-price/product/types";
import { useState, useCallback } from "react";
import { materialList } from "@/lib/quote-price/core/product/materials";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onChange: (data: Partial<Product>) => void;
}

export function ProductCard({ product, onChange }: ProductCardProps) {
  const [quantityInput, setQuantityInput] = useState(
    product.quantity.toString(),
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setQuantityInput(value);
      }
    },
    [],
  );

  const handleQuantityBlur = useCallback(() => {
    const newQuantity = parseInt(quantityInput, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onChange({ quantity: newQuantity });
    } else {
      onChange({ quantity: 1 });
      setQuantityInput("1");
    }
  }, [quantityInput, onChange]);

  const handleQuantityDecrease = useCallback(() => {
    if (product.quantity > 1) {
      const newQuantity = product.quantity - 1;
      onChange({ quantity: newQuantity });
      setQuantityInput(newQuantity.toString());
    }
  }, [product.quantity, onChange]);

  const handleQuantityIncrease = useCallback(() => {
    const newQuantity = product.quantity + 1;
    onChange({ quantity: newQuantity });
    setQuantityInput(newQuantity.toString());
  }, [product.quantity, onChange]);

  const handleMaterialChange = useCallback(
    (value: string) => {
      const selectedMaterial = materialList.find((m) => m.name === value);
      if (selectedMaterial) {
        onChange({
          material: {
            name: selectedMaterial.name,
            density: selectedMaterial.density,
            price: selectedMaterial.pricePerKg,
            shrinkageRate: selectedMaterial.lossRate,
            processingTemp: 0,
          },
        });
      }
    },
    [onChange],
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onChange({ color: value });
    },
    [onChange],
  );

  return (
    <Card className="p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex w-full gap-8">
        {/* 左侧：图片和尺寸信息 */}
        <div className="w-1/2">
          {/* 图片容器 */}
          <div className="mb-8">
            <div className="max-w-[240px] mx-auto">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
                {product.image && (
                  <Image
                    src={URL.createObjectURL(product.image.file)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 240px) 100vw, 240px"
                    className="object-contain p-2"
                    priority
                  />
                )}
              </div>
            </div>
          </div>

          {/* 尺寸显示 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 mb-1.5">宽度 (mm)</Label>
              <Input
                type="number"
                value={product.dimensions.width}
                readOnly
                className="bg-gray-50 border-gray-200 font-medium text-gray-700"
              />
            </div>
            <div>
              <Label className="text-gray-600 mb-1.5">高度 (mm)</Label>
              <Input
                type="number"
                value={product.dimensions.height}
                readOnly
                className="bg-gray-50 border-gray-200 font-medium text-gray-700"
              />
            </div>
            <div>
              <Label className="text-gray-600 mb-1.5">深度 (mm)</Label>
              <Input
                type="number"
                value={product.dimensions.depth}
                readOnly
                className="bg-gray-50 border-gray-200 font-medium text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* 右侧：材料、颜色和数量 */}
        <div className="w-1/2 space-y-6">
          {/* 材料选择 */}
          <div>
            <Label className="text-gray-600 mb-1.5">
              材料
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={product.material.name}
              onValueChange={handleMaterialChange}
            >
              <SelectTrigger
                className={cn(
                  "border-gray-200 hover:border-blue-400 transition-colors",
                  !product.material.name && "border-red-200 text-red-500",
                )}
              >
                <SelectValue placeholder="请选择材料" />
              </SelectTrigger>
              <SelectContent>
                {materialList.map((material) => (
                  <SelectItem
                    key={material.name}
                    value={material.name}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{material.name}</span>
                      <span className="text-xs text-gray-500">
                        (密度: {material.density})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!product.material.name && (
              <p className="text-sm text-red-500 mt-1.5">请选择材料</p>
            )}
          </div>

          {/* 颜色输入 */}
          <div>
            <Label className="text-gray-600 mb-1.5">
              颜色
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              type="text"
              value={product.color}
              onChange={handleColorChange}
              placeholder="请输入颜色"
              className={cn(
                "border-gray-200 focus:border-blue-400 transition-colors",
                !product.color && "border-red-200",
              )}
            />
            {!product.color && (
              <p className="text-sm text-red-500 mt-1.5">请输入颜色</p>
            )}
          </div>

          {/* 数量调整 */}
          <div>
            <Label className="text-gray-600 mb-1.5">
              数量
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleQuantityDecrease}
                disabled={product.quantity <= 1}
                className="border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                value={quantityInput}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className={cn(
                  "w-20 text-center border-gray-200",
                  !quantityInput && "border-red-200",
                )}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleQuantityIncrease}
                className="border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {!quantityInput && (
              <p className="text-sm text-red-500 mt-1.5">请输入数量</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
