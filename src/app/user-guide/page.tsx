"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UploadStep from "@/components/upload-step/upload-step";
import ProductInfoStep from "@/components/product-info-step/product-info-step";
import ConfirmStep from "@/components/confirm-step/confirm-step";
import PriceCalculationStep from "@/components/price-calculation-step/price-calculation-step";
import type { UploadFile } from "@/types/user-guide/upload";
import type { ProductInfo } from "@/types/user-guide/product";
import { toast } from "sonner";

interface StepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  uploadedFiles?: UploadFile[];
  products?: ProductInfo[];
  moldMaterial?: string;
}

export default function UserGuidePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [moldMaterial, setMoldMaterial] = useState<string>("");
  const totalSteps = 4;
  // const { toast } = useToast();
  const handleNext = () => {
    if (!isStepValid) return;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      setIsStepValid(false);
    } else {
      toast.success("感谢您的使用！我们会尽快与您联系。");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setIsStepValid(true);
    }
  };

  const handleStepValidityChange = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  const handleFilesChange = (files: UploadFile[]) => {
    setUploadedFiles(files);
  };

  const handleProductsChange = (newProducts: ProductInfo[]) => {
    setProducts(newProducts);
  };

  const handleMoldMaterialChange = (material: string) => {
    setMoldMaterial(material);
  };

  const renderStep = () => {
    const stepProps: StepProps = {
      currentStep,
      isValid: isStepValid,
      onValidityChange: handleStepValidityChange,
      uploadedFiles,
      products,
      moldMaterial,
    };

    switch (currentStep) {
      case 1:
        return <UploadStep {...stepProps} onFilesChange={handleFilesChange} />;
      case 2:
        return (
          <ProductInfoStep
            {...stepProps}
            onProductsChange={handleProductsChange}
          />
        );
      case 3:
        return (
          <ConfirmStep
            {...stepProps}
            onMoldMaterialChange={handleMoldMaterialChange}
          />
        );
      case 4:
        return <PriceCalculationStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index + 1}
                className={`flex-1 h-2 mx-1 rounded ${
                  index + 1 <= currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between px-1">
            <span>上传文件</span>
            <span>填写产品资料</span>
            <span>确认产品资料</span>
            <span>选择产品方案</span>
          </div>
        </div>

        <div className="min-h-[400px]">{renderStep()}</div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            上一步
          </Button>
          <Button onClick={handleNext} disabled={!isStepValid}>
            {currentStep === totalSteps ? "完成" : "下一步"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
