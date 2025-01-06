"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Calculator } from "lucide-react";
import CuboidForm, { type FormSchema } from "./cuboid-form";
import {
  searchBestCavityCount,
  type ProductProps,
  type CompleteSolution,
} from "@/lib/quote-price/optimization/search-cavity";
import DispalyCard from "./display-card";

interface CavitySeekerProps {
  moldMaterial: string;
}

export default function CavitySeeker({ moldMaterial }: CavitySeekerProps) {
  const [cuboids, setCuboids] = useState<ProductProps[]>([]);
  const [solution, setSolution] = useState<CompleteSolution[]>([]);

  const addCuboid = () => {
    const newCuboid: ProductProps = {
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

    const result = searchBestCavityCount(
      cuboids,
      [{ materialName: moldMaterial }],
      {
        isForceColorSimultaneous: false,
        isForceMaterialSimultaneous: false,
      },
    );

    setSolution(result);
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

      {solution.length > 0 && (
        <div className="space-y-4">
          <DispalyCard solution={solution} />
        </div>
      )}
    </div>
  );
}

export type { FormSchema };
