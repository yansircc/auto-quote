const extraProcessFeeList = [
  { material: "P20", coefficient: 0 },
  { material: "NAK80", coefficient: 15 },
  { material: "718H", coefficient: 5 },
  { material: "H13", coefficient: 25 },
  { material: "S136", coefficient: 25 },
];

/**
 * 计算额外加工费
 * @param {string} material 材料
 * @returns {number} 额外加工费
 */
export function getExtraProcessFee(material: string): number {
  const item = extraProcessFeeList.find((item) => item.material === material);

  if (!item) {
    throw new Error(`材料 ${material} 不存在`);
  }

  return item.coefficient;
}
