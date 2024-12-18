/**
 * path: src\lib\quote-price\mold\cost.ts
 * 这个函数用来计算模具的成本，模具成本 = 模具体积(变量) * 材料密度(常数) * 材料单位价格(常数)
 *
 * @param  {number} moldVolume 模具体积
 * @param  {number} moldMaterialDensity 材料密度
 * @param  {number} moldMaterialUnitPrice 材料单位价格
 * @return {number} 成本，单位为RMB
 */

export function calculateMoldCost(
  moldVolume: number,
  moldMaterialDensity: number,
  moldMaterialUnitPrice: number,
): number {
  return moldVolume * moldMaterialDensity * moldMaterialUnitPrice;
}
