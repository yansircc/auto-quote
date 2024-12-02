"use client";

import { Scene } from "./Scene";
import { ProductDetails } from "./ProductDetails";
import type { Rectangle } from "@/types/core/geometry";
import type { Product } from "@/types/domain/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductViewerProps {
  product?: Product;
  products?: Product[];
  layout?: Rectangle[];
}

export function ProductViewer({
  product,
  products,
  layout,
}: ProductViewerProps) {

  // 如果提供了产品列表和布局，显示布局视图
  if (products && layout) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <Tabs defaultValue="layout" className="flex h-[600px]">
          <TabsList className="flex h-full w-48 flex-col justify-start space-y-2 bg-muted p-2">
            <TabsTrigger value="layout" className="w-full justify-start">布局视图</TabsTrigger>
            {products.map((p) => (
              <TabsTrigger
                key={p.id}
                value={p.id.toString()}
                className="w-full justify-start"
              >
                {p.name || `产品 ${p.id}`}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1">
            <TabsContent value="layout" className="m-0 h-full data-[state=active]:block">
              <Scene products={products} layout={layout} />
            </TabsContent>
            {products.map((p) => (
              <TabsContent
                key={p.id}
                value={p.id.toString()}
                className="m-0 h-full data-[state=active]:block"
              >
                <div className="grid h-full grid-cols-[2fr,1fr] gap-6">
                  <Scene product={p} />
                  <ProductDetails product={p} />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    );
  }

  // 如果只提供了单个产品，显示单个产品视图
  if (product) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-[2fr,1fr] gap-6">
          <Scene product={product} />
          <ProductDetails product={product} />
        </div>
      </div>
    );
  }

  return null;
}
