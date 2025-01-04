import type { UploadFile } from "./upload";

export interface ProductInfo {
  id: string;
  fileId: string;
  fileName: string;
  quantity: number;
  material: string;
  color: string;
  surface: string;
  notes: string;
  image?: UploadFile;
  depth: number;
  width: number;
  height: number;
}
