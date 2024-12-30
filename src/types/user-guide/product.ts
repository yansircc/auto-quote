import { type UploadFile } from "./upload";

export interface ProductInfo {
  id: string;
  material?: string;
  color?: string;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
  image: UploadFile;
}
