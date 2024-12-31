import { calculateMinArea, getMoldDimensions, getMoldTotalPrice } from "./mold";
import { getCheapestMachine } from "./machine";
import { getProductMaterial, getMoldMaterial } from "./core";
import type { ForceOptions, Dimensions } from "./core";
import { calculateProductCosts } from "./product/cost";

interface ProductProps {
  materialName: string;
  quantity: number;
  weight: number;
  cavityIndex: number;
  shots: number;
  color: string;
  dimensions: Dimensions;
  netVolume: number;
}

interface MoldProps {
  materialName: string;
  cavities: Record<string, number>;
}

/**
 * 计算模具的最终价格
 * @param {ProductProps[]} products 产品
 * @param {MoldProps} mold 模具
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {number} 模具的最终价格
 */
export function runPipeline(
  products: ProductProps[],
  mold: MoldProps,
  forceOptions?: ForceOptions,
): number {
  // 计算产品组成的最小xy平面的二维面积
  const minArea = calculateMinArea(
    products.map((product) => ({
      width: product.dimensions.width,
      height: product.dimensions.depth,
    })),
  );

  const maxHeight = products.reduce((max, product) => {
    return Math.max(max, product.dimensions.height);
  }, 0);

  // 计算实际的模具尺寸
  const moldDimensions = getMoldDimensions({
    width: minArea.width,
    depth: minArea.height, // 注意这里，模具的深度对应的是最小面积的高度
    height: maxHeight,
  });

  // 计算模具总价，包含材料成本、采购成本、额外加工费、毛利
  const moldTotalPrice = getMoldTotalPrice(
    moldDimensions,
    getMoldMaterial(mold.materialName),
  );

  // 计算注胶总质量
  const totalInjectionWeight = products.reduce((sum, product) => {
    return (
      sum + product.netVolume * getProductMaterial(product.materialName).density
    );
  }, 0);

  // 根据模具尺寸和注胶量选择最便宜的机器
  const machineConfig = getCheapestMachine(
    moldDimensions,
    totalInjectionWeight,
  );

  // 组装产品属性
  const cavities = Object.values(mold.cavities);
  const productProps = products.map((product) => ({
    ...product,
    weight:
      product.netVolume * getProductMaterial(product.materialName).density,
  }));

  // 计算产品的总价格（包含材料成本、损耗成本、加工费、毛利）
  const productCosts = calculateProductCosts(
    productProps,
    machineConfig,
    cavities,
    forceOptions,
  );

  // 返回模具总价和产品总价之和
  return moldTotalPrice + productCosts;
}
