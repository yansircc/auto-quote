"use client";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/quote-price/product/types";
import { useEffect, useState } from "react";
import { ProductSummaryCard } from "./product-summary-card";
import { moldMaterialList } from "@/lib/quote-price/core/mold/materials";
import { cn } from "@/lib/utils";

interface ConfirmStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  products?: Product[];
  onMoldMaterialChange?: (material: string) => void;
  moldMaterial?: string;
}

export default function ConfirmStep({
  products = [],
  onValidityChange,
  onMoldMaterialChange,
  moldMaterial = "",
}: ConfirmStepProps) {
  const [selectedMaterial, setSelectedMaterial] = useState(moldMaterial);

  useEffect(() => {
    setSelectedMaterial(moldMaterial);
  }, [moldMaterial]);

  useEffect(() => {
    onValidityChange?.(Boolean(selectedMaterial));
    onMoldMaterialChange?.(selectedMaterial);
  }, [selectedMaterial, onValidityChange, onMoldMaterialChange]);

  if (!products.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">没有产品信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          确认产品资料
        </h2>
        <p className="text-gray-600">
          请仔细确认以下产品信息，并选择合适的模具材料
        </p>
      </div>

      {/* 产品列表 */}
      <div className="grid gap-6">
        {products.map((product, index) => (
          <ProductSummaryCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>

      {/* 模具材料选择 */}
      <Card className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="max-w-md space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            选择模具材料
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger
              className={cn(
                "border-gray-200 hover:border-blue-400 transition-colors",
                !selectedMaterial && "border-red-200",
              )}
            >
              <SelectValue placeholder="请选择模具材料" />
            </SelectTrigger>
            <SelectContent>
              {moldMaterialList.map((material) => (
                <SelectItem
                  key={material.name}
                  value={material.name}
                  className="hover:bg-blue-50"
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
          {!selectedMaterial && (
            <p className="text-sm text-red-500">请选择模具材料</p>
          )}
        </div>
      </Card>
    </div>
  );
}
