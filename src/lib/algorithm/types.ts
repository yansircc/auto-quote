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
  solutions: string[];
}

export interface ResponseData {
  weightDiff: number;
  weights: number[];
  message: Message;
  totalSolutions: number;
  solutions: Solution[];
}
