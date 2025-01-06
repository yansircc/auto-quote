"use client";

import { useState } from "react";
import { moldMaterialList } from "@/lib/quote-price/core";
import CavitySeeker from "./cavity-seeker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CuboidCreatorPage() {
  const [moldMaterial, setMoldMaterial] = useState("P20");

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">穴数组合模拟器</h1>
          <p className="text-lg text-muted-foreground">
            仅供参考，验证搜索穴数的逻辑是否正确
          </p>
        </div>
        <div className="w-[200px]">
          <Select value={moldMaterial} onValueChange={setMoldMaterial}>
            <SelectTrigger>
              <SelectValue placeholder="选择模具材料" />
            </SelectTrigger>
            <SelectContent>
              {moldMaterialList.map((material, index) => (
                <SelectItem key={index} value={material.name}>
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CavitySeeker moldMaterial={moldMaterial} />
      </div>
    </div>
  );
}
