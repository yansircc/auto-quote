"use client";

import { useEffect, useState, useCallback } from "react";
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
  products?: ProductInfo[];
}

export default function ProductInfoStep({
  currentStep,
  onValidityChange,
  uploadedFiles = [],
  onProductsChange,
  products: initialProducts = [],
}: ProductInfoStepProps) {
  const [products, setProducts] = useState<ProductInfo[]>(initialProducts);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      if (currentIndex >= initialProducts.length) {
        setCurrentIndex(initialProducts.length - 1);
      }
    } else if (uploadedFiles.length > 0) {
      const newProducts: ProductInfo[] = uploadedFiles.map((file) => {
        const randomDimension = () =>
          Math.floor(Math.random() * (200 - 20 + 1)) + 20;

        return {
          id: file.id,
          fileId: file.id,
          fileName: file.file.name,
          quantity: 1,
          material: "",
          color: "",
          surface: "",
          notes: "",
          image: file.type === "image" ? file : undefined,
          depth: randomDimension(),
          width: randomDimension(),
          height: randomDimension(),
        };
      });

      setProducts(newProducts);
      onProductsChange?.(newProducts);
    }
  }, [uploadedFiles, initialProducts, currentIndex, onProductsChange]);

  const handleProductChange = useCallback(
    (data: Partial<ProductInfo>) => {
      setProducts((prevProducts) => {
        const newProducts = [...prevProducts];
        const currentProduct = newProducts[currentIndex];

        if (!currentProduct) {
          return prevProducts;
        }

        newProducts[currentIndex] = {
          ...currentProduct,
          ...data,
        };

        requestAnimationFrame(() => {
          const isValid = newProducts.every(
            (product) =>
              product.quantity > 0 && product.material && product.color,
          );
          onValidityChange?.(isValid);
          onProductsChange?.(newProducts);
        });

        return newProducts;
      });
    },
    [currentIndex, onValidityChange, onProductsChange],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, products.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const isValid = products.every(
      (product) => product.quantity > 0 && product.material && product.color,
    );
    onValidityChange?.(isValid);
  }, [products, onValidityChange]);

  if (!products.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">没有产品信息</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">无法加载产品信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          填写产品资料
        </h2>
        <p className="text-gray-600">
          请为每个产品填写相关信息，确保信息准确完整
        </p>
      </div>

      <div className="relative">
        <ProductCard
          key={`product-${currentIndex}`}
          product={currentProduct}
          onChange={handleProductChange}
        />

        {products.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              onClick={handleNext}
              disabled={currentIndex === products.length - 1}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </Button>
          </>
        )}

        {/* 分页指示器 */}
        <div className="flex justify-center gap-3 mt-6">
          {products.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-blue-600 w-6"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
