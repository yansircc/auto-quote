import {
  getMoldDimensions,
  getMoldTotalPrice,
  getTopAlignedCuboidsLayout,
  getBoundingBox,
} from "../mold";
import { getCheapestMachine } from "../machine";
import { getProductMaterial, getMoldMaterial } from "../core";
import type { ForceOptions, Dimensions } from "../core";
import { calculateProductCosts } from "../product/cost";

interface ProductProps {
  id: number;
  materialName: string;
  quantity: number;
  color: string;
  dimensions: Dimensions; // 外包围尺寸
  netVolume: number; // 净体积
  cavityCount: number;
}

interface MoldProps {
  materialName: string;
}

/**
 * 计算模具的最终价格
 * @param {ProductProps[]} products 产品
 * @param {MoldProps} mold 模具
 * @param {ForceOptions} forceOptions 强制选项，可选
 * @returns {number} 模具的最终价格
 */
export function calculateSolutionPrice(
  products: ProductProps[],
  mold: MoldProps,
  forceOptions?: ForceOptions,
): number {
  // 计算产品组成的最小xy平面的二维面积
  const optimizedLayout = getTopAlignedCuboidsLayout(
    products.map((product) => ({
      id: product.id,
      width: product.dimensions.width,
      depth: product.dimensions.depth,
      height: product.dimensions.height,
      count: product.cavityCount ?? 1, // 考虑穴数
    })),
  );

  const boundingBox = getBoundingBox(optimizedLayout);

  // 计算实际的模具尺寸
  const moldDimensions = getMoldDimensions({
    width: boundingBox.dimensions.width,
    depth: boundingBox.dimensions.depth,
    height: boundingBox.dimensions.height,
  });

  console.log("模具尺寸:", moldDimensions);

  // 计算模具总价，包含材料成本、采购成本、额外加工费、毛利
  const moldTotalPrice = getMoldTotalPrice(
    moldDimensions,
    getMoldMaterial(mold.materialName),
  );

  console.log("模具总价:", moldTotalPrice);

  // 计算注胶总质量时考虑穴数
  const totalInjectionWeight = products.reduce((sum, product) => {
    return (
      sum +
      product.netVolume *
        getProductMaterial(product.materialName).density *
        (product.cavityCount ?? 1) // 考虑穴数
    );
  }, 0);

  console.log("注胶总质量:", totalInjectionWeight);

  // 根据模具尺寸和注胶量选择最便宜的机器
  const machineConfig = getCheapestMachine(
    moldDimensions,
    totalInjectionWeight,
  );

  console.log("最便宜的机器:", machineConfig);

  // 计算产品的总价格（包含材料成本、损耗成本、加工费、毛利）
  const productCosts = calculateProductCosts(
    products,
    machineConfig,
    forceOptions,
  );

  console.log("产品总价:", productCosts);
  console.log("模具总价 + 产品总价:", moldTotalPrice + productCosts);

  // 返回模具总价和产品总价之和
  return moldTotalPrice + productCosts;
}
