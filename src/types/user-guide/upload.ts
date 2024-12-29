export interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  type: "image" | "model";
}

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
