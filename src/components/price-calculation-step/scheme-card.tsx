"use client";

import { Card } from "@/components/ui/card";
import type { ProductScheme } from "@/types/user-guide/scheme";

interface SchemeCardProps {
  scheme: ProductScheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <Card className="p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">方案概览</h3>
          <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            方案 {scheme.id}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">总价格</p>
            <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ${scheme.totalPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">方案评分</p>
            <p className="text-xl font-semibold text-blue-600">
              {scheme.score}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">分组数量</p>
            <p className="text-xl font-semibold text-gray-800">
              {scheme.groupCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">模具总价</p>
            <p className="text-xl font-semibold text-blue-700">
              ${scheme.moldPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">产品总价</p>
            <p className="text-xl font-semibold text-blue-700">
              ${scheme.productPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
