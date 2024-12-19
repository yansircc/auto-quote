// 模具材料类型
export interface MoldMaterial {
  id: string;
  name: string;
  density: number; // 密度 (g/cm³)
  pricePerKg: number; // 单价 (元/kg)
}

// 产品材料类型
export interface ProductMaterial {
  id: string;
  name: string;
  density: number; // 密度 (g/cm³)
  pricePerKg: number; // 单价 (元/kg)
}

// 颜色类型
export interface Color {
  id: string;
  name: string;
  code: string; // 颜色代码
}
