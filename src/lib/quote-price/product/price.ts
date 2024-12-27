import { getProductMaterial } from "../materials/product-materials";
import {
  type ProductPrice,
  type ProductPriceDimensions,
} from "./product-schema";
import { getProductLossRate, getProductProfitRate } from "./common";

/**
 * 计算单件产品的材料价格（包含损耗）
 * @param {number} volume 产品体积
 * @param {string} productMaterial 产品材料
 * @returns {number} 单件产品材料价格
 */
export function calculateProductMaterialPrice(
  volume: number,
  productMaterial: string,
): number {
  const materialData = getProductMaterial(productMaterial);
  if (!materialData) {
    throw new Error(`没有找到产品材料: ${productMaterial}`);
  }
  if (!materialData.density) {
    throw new Error(`产品材料${productMaterial}的密度为空`);
  }
  const weight = volume * materialData.density;

  return weight * getProductLossRate() * materialData.pricePerKg;
}

/**
 * 计算单件产品的材料重量
 * @param {number} volume 产品体积
 * @param {string} productMaterial 产品材料
 * @returns {number} 单件产品材料重量
 */
export function calculateProductMaterialWeight(
  volume: number,
  productMaterial: string,
): number {
  const materialData = getProductMaterial(productMaterial);
  if (!materialData) {
    throw new Error(`没有找到产品材料: ${productMaterial}`);
  }
  if (!materialData.density) {
    throw new Error(`产品材料${productMaterial}的密度为空`);
  }
  return volume * materialData.density;
}

/**
 * 按照数量分摊生产成本
 * @param {Product} product 产品
 * @returns {number} 单件产品价格
 */
export function calculateProductPrice(
  paramsProducts: ProductPriceDimensions[],
  maxMachiningCost: number,
): ProductPrice[] {
  if (!paramsProducts || paramsProducts.length === 0) {
    return [];
  }
  const productsWithMaterialPrice = paramsProducts.map((product) => ({
    ...product,
    materialPrice: calculateProductMaterialPrice(
      product.volume ?? 0,
      product.productMaterial ?? "",
    ),
    weight: calculateProductMaterialWeight(
      product.volume ?? 0,
      product.productMaterial ?? "",
    ),
  }));

  let remainingProducts = productsWithMaterialPrice.map((p) => ({
    ...p,
    remainingQuantity: p.productQuantity ?? 0,
    processingCost: [] as Array<{
      productMakingQuantity: number;
      productMakingPrice: number;
      productSinglePrice: number;
      productTotalPrice: number;
    }>,
  }));

  while (remainingProducts.some((p) => p.remainingQuantity > 0)) {
    // 找出当前剩余数量中的最小值
    const minQuantity = Math.min(
      ...remainingProducts
        .filter((p) => p.remainingQuantity > 0)
        .map((p) => p.remainingQuantity),
    );

    // 计算当前还有多少种产品需要处理
    const activeProductCount = remainingProducts.filter(
      (p) => p.remainingQuantity > 0,
    ).length;

    // 计算当前组的单个产品加工费
    const currentGroupMakingPrice = maxMachiningCost / activeProductCount;

    // 为所有还有剩余数量的产品添加加工费记录
    remainingProducts = remainingProducts.map((p) => {
      if (p.remainingQuantity > 0) {
        return {
          ...p,
          remainingQuantity: p.remainingQuantity - minQuantity,
          processingCost: [
            ...p.processingCost,
            {
              productMakingQuantity: minQuantity,
              productMakingPrice: currentGroupMakingPrice,
              productSinglePrice:
                (p.materialPrice + currentGroupMakingPrice) *
                getProductProfitRate(),
              productTotalPrice:
                (p.materialPrice + currentGroupMakingPrice) *
                getProductProfitRate() *
                minQuantity,
            },
          ],
        };
      }
      return p;
    });
    // return remainingProducts；
  }
  return remainingProducts.map((p) => ({
    ...p,
    finalPrice: 0,
  }));
}

export function calculateProductFinalPrice(
  paramsProducts: ProductPrice[],
): ProductPrice[] {
  if (!paramsProducts || paramsProducts.length === 0) {
    return [];
  }
  const finalProducts = paramsProducts.map((product) => {
    const finalPrice = product.processingCost.reduce((total, cost) => {
      // const price = ((product.materialPrice + cost.productMakingPrice) * profitCoefficient / this.exchangeRate) * cost.productMakingQuantity;
      return total + (cost.productTotalPrice ?? 0);
    }, 0);

    return {
      ...product,
      finalPrice,
    };
  });
  // console.log("finalProducts:",finalProducts);
  return finalProducts;
}
