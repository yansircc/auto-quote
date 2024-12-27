interface ConfirmStepProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function ConfirmStep({
  currentStep,
  onNext,
  onPrev,
}: ConfirmStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">确认产品资料</h2>
      {/* 确认信息内容 */}
    </div>
  );
}
