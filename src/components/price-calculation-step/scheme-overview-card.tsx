"use client";

import { Card } from "@/components/ui/card";
import type { ProductScheme } from "@/types/user-guide/scheme";

interface SchemeOverviewCardProps {
  scheme: ProductScheme;
}

export function SchemeOverviewCard({ scheme }: SchemeOverviewCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">方案概览</h3>
          <div className="text-sm font-medium">方案 {scheme.id}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">总价格</p>
            <p className="text-xl font-semibold">
              ${scheme.totalPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">方案评分</p>
            <p className="text-xl font-semibold">{scheme.score}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">分组数量</p>
            <p className="text-xl font-semibold">{scheme.groupCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">模具总价</p>
            <p className="text-xl font-semibold">
              ${scheme.moldPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">产品总价</p>
            <p className="text-xl font-semibold">
              ${scheme.productPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
