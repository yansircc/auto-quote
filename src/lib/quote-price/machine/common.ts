import { machineList } from "src/lib/constants/price-constant";

/**
 * 根据机器吨位获取机器信息
 * @param {number} tonnage 机器吨位
 * @returns {(typeof machineList)[number]} 机器信息
 */
export function getMachineByTonnage(tonnage: number) {
  if (tonnage <= 0) {
    throw new Error('机器吨位不能为零或负数');
  }

  const machine = machineList.find(machine => 
    parseInt(machine.name.replace('T', '')) >= tonnage
  );

  if (!machine) {
    throw new Error('没有找到对应的机器');
  }

  return machine;
}

/**
 * 根据机器吨位获取加工费率
 * @param {number} tonnage 机器吨位
 * @returns {number} 加工费率
 */
export function getMachiningFeeByTonnage(tonnage: number): number {
  const machine = getMachineByTonnage(tonnage);
  return machine.machiningFee;
}

/**
 * 根据机器吨位获取小批量加工费率
 * @param {number} tonnage 机器吨位
 * @returns {number} 小批量加工费率
 */
export function getSmallBatchMachiningFeeByTonnage(tonnage: number): number {
  const machine = getMachineByTonnage(tonnage);
  return machine.smallBatchMachiningFee;
}
