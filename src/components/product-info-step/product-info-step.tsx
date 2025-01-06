"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import type { UploadFile } from "@/types/user-guide/upload";
import type { ProductInfo } from "@/types/user-guide/product";

interface ProductInfoStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  uploadedFiles?: UploadFile[];
  onProductsChange?: (products: ProductInfo[]) => void;
}

// 添加生成随机尺寸的辅助函数
function generateRandomDimensions() {
  // 生成 50-300 之间的随机整数
  return {
    length: Math.floor(Math.random() * (300 - 50 + 1)) + 50,
    width: Math.floor(Math.random() * (300 - 50 + 1)) + 50,
    height: Math.floor(Math.random() * (300 - 50 + 1)) + 50,
  };
}

export default function ProductInfoStep({
  uploadedFiles,
  onValidityChange,
  onProductsChange,
}: ProductInfoStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  // 根据上传的图片初始化产品列表，包含随机尺寸
  useEffect(() => {
    if (uploadedFiles?.length) {
      const initialProducts: ProductInfo[] = uploadedFiles.map((file) => {
        const dimensions = generateRandomDimensions();
        return {
          id: file.id,
          image: file,
          quantity: 1,
          material: "",
          color: "",
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
        };
      });
      setProducts(initialProducts);
    }
  }, [uploadedFiles]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(products.length - 1, prev + 1));
  };

  const handleProductChange = (
    productId: string,
    data: Partial<ProductInfo>,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data } : p)),
    );
  };

  // 验证所有产品信息是否完整
  useEffect(() => {
    const isValid = products.every(
      (product) => product.material && product.color && product.quantity > 0,
    );
    // const isValid = true;
    onValidityChange?.(isValid);
  }, [products, onValidityChange]);

  // 当产品信息更新时，通知父组件
  useEffect(() => {
    onProductsChange?.(products);
  }, [products, onProductsChange]);

  if (products.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">请先上传产品图片</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">填写产品资料</h2>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {products.length}
        </p>
      </div>

      <div className="relative">
        {/* 修改滑动按钮样式，增加明显的背景色 */}
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-blue-500 shadow-lg border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-colors"
            onClick={handlePrevious}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </Button>
        )}

        {currentIndex < products.length - 1 && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-blue-500 shadow-lg border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-colors"
            onClick={handleNext}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </Button>
        )}

        {/* 产品卡片容器 - 添加背景色和圆角 */}
        <div className="overflow-hidden rounded-lg bg-muted/30">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-full flex-shrink-0 p-4"
                style={{ minWidth: "100%" }}
              >
                <ProductCard
                  product={product}
                  onChange={(data) => handleProductChange(product.id, data)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 分页指示器 */}
      <div className="flex justify-center gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : "bg-gray-200"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
