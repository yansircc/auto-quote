import type { Product } from "../product/types";
import type { MachineConfig, ProcessingConfig } from "./types";
import { machineList } from "src/lib/constants/price-constant";

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
  // 伪代码
  if(machineTonnage <= 0) {
    throw new Error('机器吨位不能为零跟负数');
  }

  const machine = machineList.find(machine => parseInt(machine.name.replace('T', '')) >= machineTonnage);
  if(!machine) {
    throw new Error('没有找到对应的机器');
  }

  return machine.machiningFee;
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
  const machine = machineList.find(machine => parseInt(machine.name.replace('T', '')) >= tonnage);
  if(!machine) {
    throw new Error('没有找到对应的机器');
  }
  return machine.machiningFee * shots;
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
  // 当产品颜色不同时，需要分别生产
  // 总加工费 = 每个产品的模次 × 费率
  //获取最大吨位
  const machine = machineList.find(machine => parseInt(machine.name.replace('T', '')) >= maxTonnage);
  if(!machine) {
    throw new Error('没有找到对应的机器');
  }
  if(products.length === 0) {
    throw new Error('产品列表不能为空');
  }
  const machiningFee = machine.machiningFee;
  
  // 进行一下分组，如果颜色和材料都相同的，分成一个组，得到分组信息
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

  //遍历这个map进行计算
  let totalFee = 0;
  // 计算每个组的加工费，根据shots分批计算，首先取最小的乘以费率，然后用其他产品的shots减去最小的shots，再乘以费率，
  //一直到所有组的shots为0，将得到的结果相加，就是这一组的加工费，每一组的加工费再相加，就是总的加工费
  // 计算逻辑会按照最小模次逐步计算，直到所有产品的模次都被消耗完。每一轮都取当前最小的非零模次，计算该批次的费用，然后从所有产品的剩余模次中减去这个最小值，直到所有模次都变为 0
  // 假设一组中有三个产品，模次分别为：[100, 200, 300]
  // 费率为 10

  // 第一轮：
  // 最小模次 = 100
  // 费用 = 100 * 10 = 1000
  // 剩余模次 = [0, 100, 200]

  // 第二轮：
  // 最小模次 = 100
  // 费用 = 100 * 10 = 1000
  // 剩余模次 = [0, 0, 100]

  // 第三轮：
  // 最小模次 = 100
  // 费用 = 100 * 10 = 1000
  // 剩余模次 = [0, 0, 0]

  // 该组总费用 = 3000
  
  groupMap.forEach((group) => {
    let remainingShots = [...group.map(item => item.shots)];
    let groupFee = 0;
  
    while (Math.max(...remainingShots) > 0) {
      // 找出当前最小的非零模次
      const minShots = Math.min(...remainingShots.filter(shots => shots > 0));
      
      // 计算当前批次的费用（最小模次 × 费率）
      groupFee += minShots * machiningFee;
      
      // 更新剩余模次
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
