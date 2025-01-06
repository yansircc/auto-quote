import type { Metadata } from "next";
import CuboidCreator from "./cuboid-creator";

export const metadata: Metadata = {
  title: "Cuboid Creator",
  description: "Create and manage multiple cuboids with ease",
};

export default function CuboidCreatorPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">价格模拟器</h1>
          <p className="text-lg text-muted-foreground">
            仅供参考，验证价格计算结果和逻辑是否正确
          </p>
        </div>
        <CuboidCreator />
      </div>
    </div>
  );
}
