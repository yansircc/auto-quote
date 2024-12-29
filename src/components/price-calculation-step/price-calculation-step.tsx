interface PriceCalculationStepProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function PriceCalculationStep({
  currentStep,
  onNext,
  onPrev,
}: PriceCalculationStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">计算产品价格</h2>
      {/* 价格计算结果内容 */}
    </div>
  );
}
