export interface ProductScheme {
  id: number;
  totalPrice: number; // 总价格
  productPrice: number; // 产品总价
  moldPrice: number; // 模具总价
  score: number; // 方案评分
  groupCount: number; // 分组数量
  moldMaterial: string; // 模具材料
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number; // 模具重量
}
