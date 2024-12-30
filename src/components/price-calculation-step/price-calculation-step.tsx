"use client";

import { useEffect, useState } from "react";
import type { ProductInfo } from "@/types/user-guide/product";
import type { ProductScheme } from "@/types/user-guide/scheme";
import { ProductSummaryCard } from "../confirm-step/product-summary-card";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchemeCard } from "./scheme-card";

interface PriceCalculationStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  products?: ProductInfo[];
  moldMaterial?: string;
}

// 模拟生成方案数据
function generateSchemes(): ProductScheme[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    totalPrice: Math.round(1000 + Math.random() * 4000),
    productPrice: Math.round(1000 + Math.random() * 4000),
    moldPrice: Math.round(1000 + Math.random() * 4000),
    score: Math.round(70 + Math.random() * 30),
    groupCount: Math.round(1 + Math.random() * 5),
    moldMaterial: "aluminum",
    dimensions: {
      width: Math.round(100 + Math.random() * 200),
      height: Math.round(100 + Math.random() * 200),
      depth: Math.round(50 + Math.random() * 100),
    },
    weight: Number((5 + Math.random() * 15).toFixed(2)),
  }));
}

export default function PriceCalculationStep({
  products,
  moldMaterial,
  onValidityChange,
}: PriceCalculationStepProps) {
  const [schemes] = useState<ProductScheme[]>(generateSchemes);
  // 默认选择第一个方案
  const [selectedScheme, setSelectedScheme] = useState<string>(
    schemes[0]?.id.toString() ?? "",
  );
  const currentScheme = schemes.find((s) => s.id.toString() === selectedScheme);

  // 设置步骤为有效，当选择了方案时
  useEffect(() => {
    onValidityChange?.(Boolean(selectedScheme));
  }, [selectedScheme, onValidityChange]);

  if (!products?.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">没有产品信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">选择产品方案</h2>
        <div className="w-[300px]">
          <Select value={selectedScheme} onValueChange={setSelectedScheme}>
            <SelectTrigger>
              <SelectValue placeholder="请选择方案" />
            </SelectTrigger>
            <SelectContent>
              {schemes.map((scheme) => (
                <SelectItem key={scheme.id} value={scheme.id.toString()}>
                  方案{scheme.id} - 价格-${scheme.totalPrice.toLocaleString()},
                  评分-
                  {scheme.score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 选中的方案详情 */}
      {currentScheme && <SchemeCard scheme={currentScheme} />}

      {/* 模具材料信息 */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">模具材料</h3>
          <p className="text-muted-foreground">
            选择的模具材料：
            <span className="text-foreground ml-2">
              {moldMaterial === "aluminum"
                ? "铝材"
                : moldMaterial === "steel"
                  ? "钢材"
                  : moldMaterial === "copper"
                    ? "铜材"
                    : "未选择"}
            </span>
          </p>
        </div>
      </Card>

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
    </div>
  );
}
