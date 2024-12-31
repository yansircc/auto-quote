"use client";

import { Card } from "@/components/ui/card";

interface MoldInfoCardProps {
  material: string;
  weight: number;
  price: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export function MoldInfoCard({
  material,
  weight,
  price,
  dimensions,
}: MoldInfoCardProps) {
  // 计算体积（立方毫米转立方厘米）
  const volume = (
    (dimensions.width * dimensions.height * dimensions.depth) /
    1000
  ).toFixed(2);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">模具信息</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">模具材料</p>
          <p className="font-medium">{material}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">模具重量</p>
          <p className="font-medium">{weight.toFixed(2)} kg</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">模具价格</p>
          <p className="font-medium">${price.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">模具体积</p>
          <p className="font-medium">{volume} mm³</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-muted-foreground mb-1">模具尺寸</p>
          <p className="font-medium">
            {dimensions.width} × {dimensions.height} × {dimensions.depth} mm
          </p>
        </div>
      </div>
    </Card>
  );
}
