"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Calculator } from "lucide-react";
import CuboidForm, { type FormSchema } from "./cuboid-form";
import {
  calculateSolutionPrice,
  type SolutionPriceResult,
} from "@/lib/quote-price/optimization/solution-price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CuboidData {
  id: number;
  materialName: string;
  quantity: number;
  color: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  netVolume: number;
  cavityCount: number;
}

export default function CuboidCreator() {
  const [cuboids, setCuboids] = useState<CuboidData[]>([]);
  const [priceResult, setPriceResult] = useState<SolutionPriceResult | null>(
    null,
  );

  const addCuboid = () => {
    const newCuboid: CuboidData = {
      id: cuboids.length,
      materialName: "ABS",
      quantity: 10000,
      color: "#000000",
      dimensions: {
        width: 100,
        depth: 100,
        height: 100,
      },
      netVolume: 50000,
      cavityCount: 1,
    };
    setCuboids([...cuboids, newCuboid]);
  };

  const updateCuboid = (id: number, updatedData: Partial<FormSchema>) => {
    setCuboids(
      cuboids.map((cuboid) =>
        cuboid.id === id ? { ...cuboid, ...updatedData } : cuboid,
      ),
    );
  };

  const deleteCuboid = (id: number) => {
    setCuboids(cuboids.filter((cuboid) => cuboid.id !== id));
  };

  const calculatePrice = () => {
    if (cuboids.length === 0) return;

    const result = calculateSolutionPrice(
      cuboids,
      { materialName: "P20" }, // Default mold material
      {
        isForceColorSimultaneous: false,
        isForceMaterialSimultaneous: false,
      },
    );

    setPriceResult(result);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cuboids.map((cuboid) => (
          <Card key={cuboid.id} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteCuboid(cuboid.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              <CuboidForm cuboid={cuboid} onUpdate={updateCuboid} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={addCuboid}
          variant="outline"
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <PlusCircle className="h-4 w-4" />
          Add Cuboid
        </Button>

        <Button
          onClick={calculatePrice}
          variant="default"
          className="gap-2"
          disabled={cuboids.length === 0}
        >
          <Calculator className="h-4 w-4" />
          Calculate Price
        </Button>
      </div>

      {priceResult && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Price Summary</h3>
                <div className="text-2xl font-bold text-primary">
                  Total: ¥{priceResult.total.toLocaleString()}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Breakdown</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Mold</TableCell>
                      <TableCell>
                        ¥{priceResult.breakdown.mold.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          Material: ¥
                          {priceResult.breakdown.mold.breakdown.materialCost.toLocaleString()}
                          <br />
                          Purchase: ¥
                          {priceResult.breakdown.mold.breakdown.purchaseCost.toLocaleString()}
                          <br />
                          Processing: ¥
                          {priceResult.breakdown.mold.breakdown.processingFee.toLocaleString()}
                          <br />
                          Profit: ¥
                          {priceResult.breakdown.mold.breakdown.grossProfit.toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Product</TableCell>
                      <TableCell>
                        ¥{priceResult.breakdown.product.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          Material: ¥
                          {priceResult.breakdown.product.breakdown.materialCost.toLocaleString()}
                          <br />
                          Waste: ¥
                          {priceResult.breakdown.product.breakdown.wasteCost.toLocaleString()}
                          <br />
                          Processing: ¥
                          {priceResult.breakdown.product.breakdown.processingFee.toLocaleString()}
                          <br />
                          Profit: ¥
                          {priceResult.breakdown.product.breakdown.grossProfit.toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Mold Dimensions:
                    </span>
                    <div>
                      W: {priceResult.details.moldDimensions.width}mm
                      <br />
                      D: {priceResult.details.moldDimensions.depth}mm
                      <br />
                      H: {priceResult.details.moldDimensions.height}mm
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Machine:</span>
                    <div>{priceResult.details.cheapestMachine.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export type { FormSchema };
