import { constantSettingList } from "src/lib/constants/price-constant";

/**
 * 获取产品的利润参数
 * @returns {number} 利润参数
 */
export function getProductProfitRate(): number {
  const profitCoefficient = constantSettingList.find(
    (rule) => rule.constantName === "productProfitRate",
  );
  if (!profitCoefficient) {
    throw new Error("产品利润系数不能为空");
  }
  return profitCoefficient.constantValue;
}

/**
 * 获取产品的安全注胶系数
 * @returns {number} 安全注胶系数
 */
export function getProductSafetyFactor(): number {
  const safetyFactor = constantSettingList.find(
    (rule) => rule.constantName === "injectionSafetyFactor",
  );
  if (!safetyFactor) {
    throw new Error("产品安全注胶系数不能为空");
  }
  return safetyFactor.constantValue;
}

/**
 * 获取产品的损耗率
 * @returns {number} 损耗率
 */
export function getProductLossRate(): number {
  const lossRate = constantSettingList.find(
    (rule) => rule.constantName === "fixedLossRate",
  );
  if (!lossRate) {
    throw new Error("损耗率不能为空");
  }
  return lossRate.constantValue;
}

/**
 * 获取模具的材料销售单价
 * @returns {number} 模具的材料销售单价
 */
export function getMoldMaterialPerPrice(): number {
  const moldMaterialPerPrice = constantSettingList.find(
    (rule) => rule.constantName === "moldMaterialPerPrice",
  );
  if (!moldMaterialPerPrice) {
    throw new Error("模具材料单价不能为空");
  }
  return moldMaterialPerPrice.constantValue;
}

/**
 * 获取模具的材料密度
 * @returns {number} 模具的材料密度
 */
export function getMoldMaterialDensity(): number {
  const moldMaterialDensity = constantSettingList.find(
    (rule) => rule.constantName === "defaultMoldMaterialDensity",
  );
  if (!moldMaterialDensity) {
    throw new Error("模具材料密度不能为空");
  }
  return moldMaterialDensity.constantValue;
}

/**
 * 获取模具的最小销售重量
 * @returns {number} 模具的最小销售重量
 */
export function getMoldMinSalesWeight(): number {
  const minSalesWeight = constantSettingList.find(
    (rule) => rule.constantName === "minSalesWeight",
  );
  if (!minSalesWeight) {
    throw new Error("模具的最小销售重量不能为空");
  }
  return minSalesWeight.constantValue;
}

/**
 * 获取模具的最小计算重量
 * @returns {number} 模具的最小计算重量
 */
export function getMoldMinCalculatedWeight(): number {
  const minCalculatedWeight = constantSettingList.find(
    (rule) => rule.constantName === "minCalculatedWeight",
  );
  if (!minCalculatedWeight) {
    throw new Error("模具的最小计算重量不能为空");
  }
  return minCalculatedWeight.constantValue;
}

/**
 * 获取模具的最大计算重量
 * @returns {number} 模具的最大计算重量
 */
export function getMoldMaxCalculatedWeight(): number {
  const maxCalculatedWeight = constantSettingList.find(
    (rule) => rule.constantName === "maxCalculatedWeight",
  );
  if (!maxCalculatedWeight) {
    throw new Error("模具的最大计算重量不能为空");
  }
  return maxCalculatedWeight.constantValue;
}

/**
 * 获取模具的材料成本分段一
 * @returns { number} 模具的材料成本分段一
 */
export function getMoldMaterialCostStepOne(): number {
  const moldMaterialCostStepOne = constantSettingList.find(
    (rule) => rule.constantName === "moldMaterialCostStepOne",
  );
  if (!moldMaterialCostStepOne) {
    throw new Error("模具的材料成本分段一不能为空");
  }
  return moldMaterialCostStepOne.constantValue;
}

/**
 * 获取模具的材料成本分段二
 * @returns {number} 模具的材料成本分段二
 */
export function getMoldMaterialCostStepTwo(): number {
  const moldMaterialCostStepTwo = constantSettingList.find(
    (rule) => rule.constantName === "moldMaterialCostStepTwo",
  );
  if (!moldMaterialCostStepTwo) {
    throw new Error("模具的材料成本分段二不能为空");
  }
  return moldMaterialCostStepTwo.constantValue;
}

/**
 * 获取模具的小批量阈值
 * @returns {number} 模具的小批量阈值
 */
export function getSmallBatchThresholdValue(): number {
  const smallBatchThresholdValue = constantSettingList.find(
    (rule) => rule.constantName === "smallBatchThresholdValue",
  );
  if (!smallBatchThresholdValue) {
    throw new Error("小批量阈值不能为空");
  }
  return smallBatchThresholdValue.constantValue;
}
