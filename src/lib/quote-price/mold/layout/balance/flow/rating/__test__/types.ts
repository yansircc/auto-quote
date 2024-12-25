export interface TestCase {
  name: string;
  input: {
    deviation?: number;
    height?: number;
    distance?: number;
    distances?: number[];
    momentum?: number;
    moments?: number[];
    ratio?: number;
    rsd?: number;
    layoutSize?: number;
  };
  expect: {
    exact?: number;
    min?: number;
    max?: number;
  };
}

export interface TestSuite {
  description: string;
  cases: TestCase[];
}

/**
 * 测试用例的期望结果类型
 */
export interface TestExpectation {
  /** 期望的精确分数 */
  exact?: number;
  /** 期望的最小分数 */
  min?: number;
  /** 期望的最大分数 */
  max?: number;
}

/**
 * 位置测试用例输入类型
 */
export interface PositionTestInput {
  /** 偏离度 */
  deviation: number;
  /** 高度 */
  height: number;
  /** 布局尺寸 */
  layoutSize: number;
}

/**
 * 位置测试用例类型
 */
export interface PositionTestCase {
  /** 测试名称 */
  name: string;
  /** 测试输入 */
  input: PositionTestInput;
  /** 期望结果 */
  expect: TestExpectation;
}

/**
 * 位置测试套件类型
 */
export interface PositionTestSuite {
  /** 测试套件描述 */
  description: string;
  /** 测试用例列表 */
  cases: PositionTestCase[];
}

/**
 * 距离测试用例输入类型
 */
export interface DistanceTestInput {
  /** 距离数组 */
  distances: number[];
  /** 布局尺寸 */
  layoutSize?: number;
}

/**
 * 距离测试用例类型
 */
export interface DistanceTestCase {
  /** 测试名称 */
  name: string;
  /** 测试输入 */
  input: DistanceTestInput;
  /** 期望结果 */
  expect: TestExpectation;
}

/**
 * 距离测试套件类型
 */
export interface DistanceTestSuite {
  /** 测试套件描述 */
  description: string;
  /** 测试用例列表 */
  cases: DistanceTestCase[];
}

/**
 * 力矩测试用例输入类型
 */
export interface MomentumTestInput {
  /** 力矩数组 */
  moments: number[];
  /** 力矩比（最大力矩与平均值之比） */
  ratio: number;
  /** 相对标准差（标准差/平均值） */
  rsd: number;
}

/**
 * 力矩测试用例类型
 */
export interface MomentumTestCase {
  /** 测试名称 */
  name: string;
  /** 测试输入 */
  input: MomentumTestInput;
  /** 期望结果 */
  expect: TestExpectation;
}

/**
 * 力矩测试套件类型
 */
export interface MomentumTestSuite {
  /** 测试套件描述 */
  description: string;
  /** 测试用例列表 */
  cases: MomentumTestCase[];
}
