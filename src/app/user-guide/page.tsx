"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UploadStep from "@/components/upload-step/upload-step";
import ProductInfoStep from "@/components/product-info-step/product-info-step";
import ConfirmStep from "@/components/confirm-step/confirm-step";
import PriceCalculationStep from "@/components/price-calculation-step/price-calculation-step";
import type { UploadFile } from "@/types/user-guide/upload";
import type { Product } from "@/lib/quote-price/product/types";
import { toast } from "sonner";

// 添加联系信息接口
interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export default function UserGuidePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [moldMaterial, setMoldMaterial] = useState<string>("");
  // 添加联系信息状态
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    phone: "",
    email: "",
  });
  const totalSteps = 4;

  const handleFilesChange = useCallback((files: UploadFile[]) => {
    setUploadedFiles(files);
  }, []);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const randomDimension = () => Math.floor(Math.random() * 180) + 20;

      const newProducts: Product[] = uploadedFiles.map((file) => {
        const dimensions = {
          width: randomDimension(),
          depth: randomDimension(),
          height: randomDimension(),
        };

        const netVolume =
          dimensions.width * dimensions.depth * dimensions.height;
        const volumeIncrease = 1 + (Math.random() * 0.2 + 0.1);
        const envelopeVolume = Math.ceil(netVolume * volumeIncrease);

        return {
          id: file.id,
          name: file.file.name,
          material: {
            name: "",
            density: 0,
            price: 0,
            shrinkageRate: 0,
            processingTemp: 0,
          },
          color: "",
          dimensions,
          quantity: 1,
          netVolume,
          envelopeVolume,
          image: file.type === "image" ? file : undefined,
        };
      });

      setProducts(newProducts);
    }
  }, [uploadedFiles]);

  const handleProductsChange = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
  }, []);

  const handleMoldMaterialChange = useCallback((material: string) => {
    setMoldMaterial(material);
  }, []);

  const handleContactInfoChange = useCallback((info: Partial<ContactInfo>) => {
    setContactInfo((prev) => ({
      ...prev,
      ...info,
    }));
  }, []);

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
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      // 更新验证状态
      switch (prevStep) {
        case 1:
          // 上传文件步骤
          setIsStepValid(uploadedFiles.length > 0);
          break;
        case 2:
          // 产品信息步骤 - 检查所有必填字段
          const isProductsValid = products.every(
            (product) =>
              product.quantity > 0 && product.material && product.color,
          );
          setIsStepValid(isProductsValid);
          break;
        case 3:
          // 确认步骤
          setIsStepValid(Boolean(moldMaterial));
          break;
        default:
          setIsStepValid(true);
      }
    }
  };

  // 添加一个新的 useEffect 来处理步骤切换时的验证状态
  useEffect(() => {
    // 当步骤改变时，重新验证当前步骤
    switch (currentStep) {
      case 1:
        setIsStepValid(uploadedFiles.length > 0);
        break;
      case 2:
        const isProductsValid = products.every(
          (product) =>
            product.quantity > 0 && product.material && product.color,
        );
        setIsStepValid(isProductsValid);
        break;
      case 3:
        setIsStepValid(Boolean(moldMaterial));
        break;
      case 4:
        // 价格计算步骤的初始验证状态
        setIsStepValid(false);
        break;
    }
  }, [currentStep, uploadedFiles, products, moldMaterial]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStep
            currentStep={currentStep}
            isValid={isStepValid}
            onValidityChange={setIsStepValid}
            onFilesChange={handleFilesChange}
            initialFiles={uploadedFiles}
          />
        );
      case 2:
        return (
          <ProductInfoStep
            currentStep={currentStep}
            isValid={isStepValid}
            onValidityChange={setIsStepValid}
            onProductsChange={handleProductsChange}
            uploadedFiles={uploadedFiles}
            products={products}
          />
        );
      case 3:
        return (
          <ConfirmStep
            currentStep={currentStep}
            isValid={isStepValid}
            onValidityChange={setIsStepValid}
            onMoldMaterialChange={handleMoldMaterialChange}
            moldMaterial={moldMaterial}
            products={products}
          />
        );
      case 4:
        return (
          <PriceCalculationStep
            currentStep={currentStep}
            isValid={isStepValid}
            onValidityChange={setIsStepValid}
            products={products}
            moldMaterial={moldMaterial}
            contactInfo={contactInfo}
            onContactInfoChange={handleContactInfoChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
          模具生产定制向导
        </h1>
        <p className="text-gray-600 text-lg">
          请按照步骤填写信息，我们将为您提供最优方案
        </p>
      </div>

      <Card className="p-8 shadow-lg border-0 bg-gradient-to-b from-white to-gray-50/50">
        <div className="mb-10">
          <div className="flex justify-between mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index + 1}
                className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
                  index + 1 <= currentStep
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                    : "bg-gray-100"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-center">
            {[
              "上传产品文件",
              "填写产品资料",
              "确认产品资料",
              "选择产品方案",
            ].map((step, index) => (
              <div
                key={index}
                className={`flex-1 transition-colors duration-300 ${
                  index + 1 <= currentStep
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] bg-white rounded-lg">{renderStep()}</div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            上一步
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 ${
              !isStepValid ? "opacity-50" : "shadow-md hover:shadow-lg"
            }`}
          >
            {currentStep === totalSteps ? "完成" : "下一步"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
