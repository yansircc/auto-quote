interface ProductProps {
  materialName: string;
  quantity: number;
  color: string;
}

interface CuboidLayout {
  dimensions: {
    width: number; // x
    depth: number; // y
    height: number; // z
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  id: number;
}

/**
 * 一个暂时的风险计算函数
 *
 * @param {ProductProps[]} products 产品列表
 * @param {CuboidLayout[]} layout 模具布局
 * @param {number} wantedValue 期望值
 * @returns {number} 风险值
 */
export function getRiskScore(
  products: ProductProps[],
  layout: CuboidLayout[],
  wantedValue = 20,
): number {
  if (!wantedValue) {
    return Math.random() * 100; // 随机返回一个0-100的值
  }

  return wantedValue;
}
