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
import type { ProductInfo } from "@/types/user-guide/product";
import { useEffect, useState } from "react";
import { ProductSummaryCard } from "./product-summary-card";

interface ConfirmStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  products?: ProductInfo[];
  onMoldMaterialChange?: (material: string) => void;
  moldMaterial?: string;
}

export default function ConfirmStep({
  products,
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

  if (!products?.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">没有产品信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">确认产品资料</h2>

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
      <Card className="p-6">
        <div className="max-w-md">
          <Label className="mb-2 block">选择模具材料</Label>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="请选择模具材料" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluminum">铝材</SelectItem>
              <SelectItem value="steel">钢材</SelectItem>
              <SelectItem value="copper">铜材</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}
