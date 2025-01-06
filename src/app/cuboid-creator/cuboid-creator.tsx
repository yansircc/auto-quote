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
import DispalyCard from "./display-card";
// import { LayoutViewer } from "./layout-viewer";
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

interface CuboidCreatorProps {
  moldMaterial: string;
}

export default function CuboidCreator({ moldMaterial }: CuboidCreatorProps) {
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
      { materialName: moldMaterial },
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
        <div className="space-y-4">
          {/* <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-4 text-lg font-semibold">优化布局</h2>
            {(() => {
              console.log("Layout Data:", {
                layout: priceResult.details.optimizedLayout,
                moldDimensions: priceResult.details.moldDimensions,
              });
              return (
                <div className="relative">
                  <LayoutViewer
                    layout={priceResult.details.optimizedLayout}
                    moldDimensions={priceResult.details.moldDimensions}
                    className="h-[500px] w-full"
                  />
                </div>
              );
            })()}
          </div> */}
          <DispalyCard priceResult={priceResult} />
        </div>
      )}
    </div>
  );
}

export type { FormSchema };
