"use client";

import { BalanceAnalyzer } from '@/components/BalanceAnalyzer';
import { mockProducts, mockLayout, mockInjectionPoint } from '@/lib/algorithm/balance/mockData';

export default function BalanceVisualizerPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">模具布局平衡分析</h1>
          <p className="text-gray-600 mb-8">
            通过几何平衡、流动分析和分布平衡多个维度评估模具布局的合理性
          </p>
          
          <div className="container mx-auto py-8">
            <BalanceAnalyzer
              products={mockProducts}
              layout={mockLayout}
              injectionPoint={mockInjectionPoint}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
