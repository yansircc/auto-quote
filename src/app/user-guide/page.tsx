"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UploadStep from "@/components/upload-step/upload-step";
import ProductInfoStep from "@/components/product-info-step/product-info-step";
import ConfirmStep from "@/components/confirm-step/confirm-step";
import PriceCalculationStep from "@/components/price-calculation-step/price-calculation-step";
import type { UploadFile } from "@/types/user-guide/upload";

interface StepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  uploadedFiles?: UploadFile[];
}

export default function UserGuidePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid) {
      setCurrentStep((prev) => prev + 1);
      setIsStepValid(false); // 重置验证状态
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setIsStepValid(true); // 返回上一步时默认为有效
    }
  };

  const handleStepValidityChange = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  const handleFilesChange = (files: UploadFile[]) => {
    setUploadedFiles(files);
  };

  const renderStep = () => {
    const stepProps: StepProps = {
      currentStep,
      isValid: isStepValid,
      onValidityChange: handleStepValidityChange,
      uploadedFiles,
    };

    switch (currentStep) {
      case 1:
        return <UploadStep {...stepProps} onFilesChange={handleFilesChange} />;
      case 2:
        return <ProductInfoStep {...stepProps} />;
      case 3:
        return <ConfirmStep {...stepProps} />;
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
            <span>计算产品价格</span>
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
          <Button
            onClick={handleNext}
            disabled={currentStep === totalSteps || !isStepValid}
          >
            {currentStep === totalSteps ? "完成" : "下一步"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
