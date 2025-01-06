import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CompleteSolution } from "@/lib/quote-price/optimization/search-cavity";

export default function DisplayCard({
  solution,
}: {
  solution: CompleteSolution[];
}) {
  // 获取最优方案（第一个方案）
  const bestSolution = solution[0];

  if (!bestSolution) {
    return <div>没有找到合适的方案</div>;
  }

  return (
    <div className="space-y-6">
      {/* 最优方案展示 */}
      <Card className="mt-6 border-primary">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">最优方案</h3>
              <div className="text-2xl font-bold text-primary">
                ¥{bestSolution.total.toLocaleString()}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">方案明细</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品</TableHead>
                    <TableHead>模穴数</TableHead>
                    <TableHead>布局得分</TableHead>
                    <TableHead>风险得分</TableHead>
                    <TableHead>费用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestSolution.breakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        产品 {item.productCavityMap[0]?.productId}
                      </TableCell>
                      <TableCell>
                        {item.productCavityMap[0]?.cavityCount}
                      </TableCell>
                      <TableCell>{item.layoutScore.toFixed(2)}</TableCell>
                      <TableCell>{item.riskScore}</TableCell>
                      <TableCell>¥{item.price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 其他方案展示 */}
      {solution.slice(1).map((alterSolution, index) => (
        <Card key={index} className="mt-4">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">备选方案 {index + 1}</h3>
                <div className="text-xl font-semibold">
                  ¥{alterSolution.total.toLocaleString()}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品</TableHead>
                    <TableHead>模穴数</TableHead>
                    <TableHead>布局得分</TableHead>
                    <TableHead>风险得分</TableHead>
                    <TableHead>费用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alterSolution.breakdown.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell className="font-medium">
                        产品 {item.productCavityMap[0]?.productId}
                      </TableCell>
                      <TableCell>
                        {item.productCavityMap[0]?.cavityCount}
                      </TableCell>
                      <TableCell>{item.layoutScore.toFixed(2)}</TableCell>
                      <TableCell>{item.riskScore}</TableCell>
                      <TableCell>¥{item.price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
