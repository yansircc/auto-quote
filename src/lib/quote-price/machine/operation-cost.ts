import type { Product } from "../product/types";
import type { MachineConfig, ProcessingConfig } from "./types";
import { getMachineByTonnage, getMachiningFeeByTonnage } from "./common";

interface GroupItem {
  product: Product;
  shots: number;
}

/**
 * 根据机器吨位计算每模次的加工费用
 * @param {number} machineTonnage 机器吨位
 * @returns {number} 每模次费用
 */
export function calculateOperationCostPerShot(machineTonnage: number): number {
  return getMachiningFeeByTonnage(machineTonnage);
}

/**
 * 计算基础加工费
 * @param {number} tonnage 机器吨位
 * @param {number} shots 模次
 * @param {MachineConfig} config 机器配置
 * @returns {number} 基础加工费
 */
export function calculateBaseProcessingFee(
  tonnage: number,
  shots: number,
  config: MachineConfig,
): number {
  const machiningFee = getMachiningFeeByTonnage(tonnage);
  return machiningFee * shots;
}

/**
 * 计算多产品组合的基础加工费
 * 注意：当材料、颜色不一样时，需要单独顺序生产
 * 加工费取决于模具的总尺寸和注胶量最大的产品
 * @param {Product[]} products 产品列表
 * @param {number[]} shots 每个产品的模次
 * @param {number} maxTonnage 最大所需吨位
 * @param {MachineConfig} config 机器配置
 * @returns {number} 基础加工费
 */
export function calculateGroupProcessingFee(
  products: Product[],
  shots: number[],
  maxTonnage: number,
  config: MachineConfig | undefined,
): number {
  if(products.length === 0) {
    throw new Error('产品列表不能为空');
  }

  const machiningFee = getMachiningFeeByTonnage(maxTonnage);
  
  // 使用Map来存储分组，key为"材料-颜色"的组合
  const groupMap = new Map<string, GroupItem[]>();
    
  products.forEach((product, index) => {
    const key = `${product.material.name}-${product.color}`;
    const item = { product, shots: shots[index] ?? 0 };
    
    if (!groupMap.has(key)) {
      groupMap.set(key, [item]);
    } else {
      groupMap.get(key)?.push(item);
    }
  });

  let totalFee = 0;
  
  groupMap.forEach((group) => {
    let remainingShots = [...group.map(item => item.shots)];
    let groupFee = 0;
  
    while (Math.max(...remainingShots) > 0) {
      const minShots = Math.min(...remainingShots.filter(shots => shots > 0));
      groupFee += minShots * machiningFee;
      remainingShots = remainingShots.map(shots => 
        shots > 0 ? shots - minShots : 0
      );
    }
    
    totalFee += groupFee;
  });

  return totalFee;
}

/**
 * 计算基础加工费
 * @param {Product[]} products 产品列表
 * @param {number} shots 模次
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @param {ProcessingConfig} processingConfig 加工配置
 * @returns {number} 基础加工费
 */
export function calculateBasicOperationCost(
  products: Product[],
  shots: number,
  tonnage: number,
  config: MachineConfig,
  processingConfig: ProcessingConfig,
): number {
  // TODO:
  // 1. 根据价格指南，当材料、颜色不一样时，需要分批次顺序生产
  // 2. 加工费取决于：
  //    a. 模具的总尺寸（需要从products计算得出）
  //    b. 三个产品中注胶量最大的那款产品
  // 3. 需要考虑：
  //    a. 不同材料的标准周期时间
  //    b. 产品体积对周期时间的影响
  //    c. 机器吨位对费率的影响
  return 0;
}

/**
 * 获取最大注胶量产品
 * @param {Product[]} products 产品列表
 * @returns {Product} 注胶量最大的产品
 */
export function getMaxInjectionVolumeProduct(products: Product[]): Product {
  // TODO:
  // 1. 遍历所有产品计算注胶量
  // 2. 返回注胶量最大的产品
  // 3. 需要考虑产品为空的情况

  // 获取注胶量(重量)最大的产品
  const maxProduct = products.reduce((max, product) => {
    return max.netVolume * max.material.density > product.netVolume * product.material.density ? max : product;
  }, products[0]!);
  return maxProduct;
}

/**
 * 计算生产批次
 * @param {Product[]} products 产品列表
 * @returns {Product[][]} 按材料和颜色分组的产品批次
 */
export function calculateProductionBatches(products: Product[]): Product[][] {
  // TODO:
  // 1. 按材料分组
  // 2. 在材料组内按颜色分组
  // 3. 每个组就是一个生产批次
  if (!products || products.length === 0) {
    throw new Error('产品列表不能为空');
  }

  // 使用Map进行两级分组
  const materialGroups = new Map<string, Map<string, Product[]>>();

  products.forEach(product => {
    if (!product.material?.name) {
      throw new Error('产品材料信息不完整');
    }
    if (!product.color) {
      throw new Error('产品颜色信息不完整');
    }

    // 获取或创建材料分组
    if (!materialGroups.has(product.material.name)) {
      materialGroups.set(product.material.name, new Map<string, Product[]>());
    }
    const colorGroups = materialGroups.get(product.material.name)!;

    // 在材料分组内按颜色分组
    if (!colorGroups.has(product.color)) {
      colorGroups.set(product.color, []);
    }
    colorGroups.get(product.color)!.push(product);
  });

  // 将嵌套Map转换为二维数组
  const batches: Product[][] = [];
  materialGroups.forEach(colorGroups => {
    colorGroups.forEach(products => {
      batches.push(products);
    });
  });

  return batches;
}

/**
 * 计算每个批次的加工费
 * @param {Product[][]} batches 产品批次
 * @param {number} tonnage 机器吨位
 * @param {MachineConfig} config 机器配置
 * @param {ProcessingConfig} processingConfig 加工配置
 * @returns {number} 总加工费
 */
export function calculateBatchOperationCosts(
  batches: Product[][],
  tonnage: number,
  config: MachineConfig,
  processingConfig: ProcessingConfig,
): number {
  // TODO:
  // 1. 遍历每个批次
  // 2. 计算每个批次的模次
  // 3. 计算每个批次的基础加工费
  // 4. 累加所有批次的加工费

  return 0;
}
