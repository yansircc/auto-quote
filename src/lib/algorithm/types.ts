export interface Product {
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface GroupInfo {
  groupId: number;
  weights: number[];
  totalWeight: number;
}

export interface Solution {
  solutionId: number;
  groups: GroupInfo[];
}

export interface Message {
  general: string;
  volumeUtilization?: string;
  solutions: string[];
}

export interface ResponseData {
  weightDiff: number;
  weights: number[];
  message: Message;
  totalSolutions: number;
  solutions: Solution[];
}

export interface MoldDistribution {
  moldId: number;
  products: Product[];
  groupingResult: ResponseData;
}

export interface DistributionSolution {
  solutionId: number;
  molds: MoldDistribution[];
  totalMolds: number;
}

export interface DistributionResult {
  solutions: DistributionSolution[];
  totalSolutions: number;
  message: {
    general: string;
    details?: string[];
  };
}
