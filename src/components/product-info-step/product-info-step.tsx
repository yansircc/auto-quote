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
  const [isValidating, setIsValidating] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<ProductInfo[] | null>(
    null,
  );

  useEffect(() => {
    if (uploadedFiles.length > 0 && products.length === 0) {
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
  }, [uploadedFiles, products.length, onProductsChange]);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      if (currentIndex >= initialProducts.length) {
        setCurrentIndex(initialProducts.length - 1);
      }
    }
  }, [initialProducts, currentIndex]);

  useEffect(() => {
    if (pendingProducts) {
      onProductsChange?.(pendingProducts);
      setPendingProducts(null);
    }
  }, [pendingProducts, onProductsChange]);

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

        setPendingProducts(newProducts);
        return newProducts;
      });

      setIsValidating(true);
    },
    [currentIndex],
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
    if (isValidating) {
      const isValid = products.every(
        (product) => product.quantity > 0 && product.material && product.color,
      );
      onValidityChange?.(isValid);
      setIsValidating(false);
    }
  }, [products, onValidityChange, isValidating]);

  if (!uploadedFiles.length || !products.length) {
    return null;
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct) {
    return null;
  }

  return (
    <div className="relative">
      <ProductCard
        key={`product-${currentIndex}`}
        product={currentProduct}
        onChange={handleProductChange}
      />

<<<<<<< HEAD
      {products.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full 
            bg-sky-500 backdrop-blur hover:bg-background/90 border-2 border-border 
            shadow-lg hover:shadow-xl transition-all"
=======
      <div className="relative">
        {/* 修改滑动按钮样式，增加明显的背景色 */}
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-blue-500 shadow-lg border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-colors"
>>>>>>> upstream/main
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
<<<<<<< HEAD
            <ChevronLeft className="w-8 h-8" />
=======
            <ChevronLeft className="w-8 h-8 text-white" />
>>>>>>> upstream/main
          </Button>
          <Button
            variant="outline"
            size="icon"
<<<<<<< HEAD
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full 
            bg-sky-500 backdrop-blur hover:bg-background/90 border-2 border-border 
            shadow-lg hover:shadow-xl transition-all"
=======
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-blue-500 shadow-lg border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-colors"
>>>>>>> upstream/main
            onClick={handleNext}
            disabled={currentIndex === products.length - 1}
          >
<<<<<<< HEAD
            <ChevronRight className="w-8 h-8" />
=======
            <ChevronRight className="w-8 h-8 text-white" />
>>>>>>> upstream/main
          </Button>
        </>
      )}

<<<<<<< HEAD
      <div className="flex justify-center gap-2 mt-4">
=======
        {/* 产品卡片容器 - 添加背景色和圆角 */}
        <div className="overflow-hidden rounded-lg bg-muted/30">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {products.map((product, index) => (
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
>>>>>>> upstream/main
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
