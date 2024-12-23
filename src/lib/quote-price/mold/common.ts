import { 
  operatingExpenseList, 
  moldPriceDifferList, 
  heightSetting,
  borderSpaceRules
} from "src/lib/constants/price-constant";

/**
 * 根据模具材料名称获取价格差异系数
 * @param {string} materialName 材料名称
 * @returns {number} 价格差异系数
 */
export function getMoldPriceDifferByMaterial(materialName: string): number {
  if (!materialName) {
    throw new Error('模具材料名称不能为空');
  }

  const differItem = moldPriceDifferList.find(
    rule => rule.name.trim() === materialName
  );

  if (!differItem) {
    throw new Error('没有找到对应的模具材料价格差异');
  }

  return differItem.coefficient;
}

/**
 * 根据模具重量获取运营费用
 * @param {number} weight 模具重量
 * @returns {number} 运营费用
 */
export function getOperatingExpenseByWeight(weight: number): number {
  if (weight <= 0) {
    throw new Error('模具重量必须大于0');
  }

  const expenseItem = operatingExpenseList.find(
    rule => weight <= rule.maxWeight
  );

  if (!expenseItem) {
    throw new Error('模具重量超过运营费用阈值');
  }

  return expenseItem.price;
}


/**
 * 根据模具高度获取安全高度
 * @param {number} width 模具宽度
 * @param {number} height 模具高度
 * @returns {number} 模具高度
 */
export function getHeightByDimensions(width: number, height: number): number {
  
  const heightItem = heightSetting.find(
    rule => height <= rule.maxHeight
  );

  if (!heightItem) {
    throw new Error('模具高度超过安全高度阈值');
  }

  return heightItem.height;
}

/**
 * 根据模具宽度获取安全边距
 * @param {number} width 模具宽度
 * @returns {number} 模具边距
 */
export function getMarginByWidth(width: number): number {
  const borderSpaceItem = borderSpaceRules.find(
    rule => width <= rule.maxLength
  );

  if (!borderSpaceItem) {
    throw new Error('模具宽度超过安全边距阈值');
  }

  return borderSpaceItem.spacing;
}

