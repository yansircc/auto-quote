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
import type { SolutionPriceResult } from "@/lib/quote-price/optimization/solution-price";

export default function DispalyCard({
  priceResult,
}: {
  priceResult: SolutionPriceResult;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">价格汇总</h3>
            <div className="text-2xl font-bold text-primary">
              总计: ¥{priceResult.total.toLocaleString()}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">明细</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>类别</TableHead>
                  <TableHead>费用</TableHead>
                  <TableHead>详情</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">模具</TableCell>
                  <TableCell>
                    ¥{priceResult.breakdown.mold.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      材料费: ¥
                      {priceResult.breakdown.mold.breakdown.materialCost.toLocaleString()}
                      <br />
                      采购费: ¥
                      {priceResult.breakdown.mold.breakdown.purchaseCost.toLocaleString()}
                      <br />
                      加工费: ¥
                      {priceResult.breakdown.mold.breakdown.processingFee.toLocaleString()}
                      <br />
                      利润: ¥
                      {priceResult.breakdown.mold.breakdown.grossProfit.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">产品</TableCell>
                  <TableCell>
                    ¥{priceResult.breakdown.product.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      材料费: ¥
                      {priceResult.breakdown.product.breakdown.materialCost.toLocaleString()}
                      <br />
                      废料费: ¥
                      {priceResult.breakdown.product.breakdown.wasteCost.toLocaleString()}
                      <br />
                      加工费: ¥
                      {priceResult.breakdown.product.breakdown.processingFee.toLocaleString()}
                      <br />
                      利润: ¥
                      {priceResult.breakdown.product.breakdown.grossProfit.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-2">技术参数</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">模具尺寸:</span>
                <div>
                  宽: {priceResult.details.moldDimensions.width}mm
                  <br />
                  深: {priceResult.details.moldDimensions.depth}mm
                  <br />
                  高: {priceResult.details.moldDimensions.height}mm
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">注塑机:</span>
                <div>{priceResult.details.cheapestMachine.name}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
