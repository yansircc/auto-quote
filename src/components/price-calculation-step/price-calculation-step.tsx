"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductInfo } from "@/types/user-guide/product";
import type { ProductScheme } from "@/types/user-guide/scheme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchemeCard } from "./scheme-card";
import { MoldInfoCard } from "./mold-info-card";
import { ProductDetailsCard } from "./product-details-card";
import { ContactInfoCard } from "./contact-info-card";

interface PriceCalculationStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  products?: ProductInfo[];
  moldMaterial?: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  onContactInfoChange: (info: {
    name: string;
    phone: string;
    email: string;
  }) => void;
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
  contactInfo,
  onContactInfoChange,
}: PriceCalculationStepProps) {
  const [schemes] = useState<ProductScheme[]>(generateSchemes());
  const [selectedScheme, setSelectedScheme] = useState<string>(
    schemes[0]?.id.toString() ?? "",
  );
<<<<<<< HEAD
=======
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
>>>>>>> upstream/main
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const currentScheme = schemes.find((s) => s.id.toString() === selectedScheme);

  // 验证联系信息
  const validateContactInfo = useCallback(() => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // 验证姓名
    if (!contactInfo.name.trim()) {
      newErrors.name = "请输入姓名";
      isValid = false;
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!contactInfo.phone.trim()) {
      newErrors.phone = "请输入手机号码";
      isValid = false;
    } else if (!phoneRegex.test(contactInfo.phone)) {
      newErrors.phone = "请输入正确的手机号码";
      isValid = false;
    }

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactInfo.email.trim()) {
      newErrors.email = "请输入电子邮箱";
      isValid = false;
    } else if (!emailRegex.test(contactInfo.email)) {
      newErrors.email = "请输入正确的电子邮箱格式";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [contactInfo]);

  // 更新验证状态
  useEffect(() => {
    const isValid = validateContactInfo() && Boolean(selectedScheme);
    onValidityChange?.(isValid);
  }, [selectedScheme, contactInfo, onValidityChange, validateContactInfo]);

  if (!products?.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">没有产品信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 方案选择 */}
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
                  评分-{scheme.score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 选中的方案详情 */}
      {currentScheme && <SchemeCard scheme={currentScheme} />}

      {/* 模具信息卡片 */}
      {currentScheme && (
        <MoldInfoCard
<<<<<<< HEAD
          material={moldMaterial ?? "未选择"}
=======
          material={currentScheme.moldMaterial}
>>>>>>> upstream/main
          weight={currentScheme.weight}
          price={currentScheme.moldPrice}
          dimensions={currentScheme.dimensions}
        />
      )}

      {/* 产品详细信息 */}
      <div className="grid gap-6">
        {products?.map((product) => (
          <ProductDetailsCard
            key={product.id}
            product={product}
            costs={{
              materialCost: 100,
              processingFee: 50,
              totalCost: 150,
            }}
          />
        ))}
      </div>

      {/* 联系信息 */}
      <ContactInfoCard
        contactInfo={contactInfo}
<<<<<<< HEAD
        onChange={(info) => onContactInfoChange({ ...contactInfo, ...info })}
=======
        onChange={(info) => setContactInfo((prev) => ({ ...prev, ...info }))}
>>>>>>> upstream/main
        errors={errors}
      />
    </div>
  );
}
