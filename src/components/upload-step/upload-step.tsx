"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUploader } from "./file-uploader";
import { FileList } from "./file-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { UploadFile } from "@/types/user-guide/upload";

interface UploadStepProps {
  currentStep: number;
  isValid?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  onFilesChange: (files: UploadFile[]) => void;
  initialFiles?: UploadFile[];
}

// 支持的文件类型
const SUPPORTED_FORMATS = {
  // 3D文件格式
  "model/stl": [".stl"],
  "model/step": [".step", ".stp"],
  "model/iges": [".igs"],
  // 图片格式
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// 添加一个生成唯一ID的函数
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UploadStep({
  currentStep,
  onValidityChange,
  onFilesChange,
  initialFiles = [],
}: UploadStepProps) {
  const [files, setFiles] = useState<UploadFile[]>(initialFiles);
  const [error, setError] = useState<string>("");
  const [fileToRemove, setFileToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (initialFiles.length > 0) {
      onValidityChange?.(true);
    }
  }, [initialFiles, onValidityChange]);

  // 处理文件删除的 effect
  useEffect(() => {
    if (fileToRemove) {
      const updatedFiles = files.filter((file) => file.id !== fileToRemove);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      setFileToRemove(null);
    }
  }, [fileToRemove, files, onFilesChange]);

  const handleFilesAdded = useCallback(
    (newFiles: File[]) => {
      // 验证文件类型
      const invalidFiles = newFiles.filter((file) => {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isValidType = Object.values(SUPPORTED_FORMATS)
          .flat()
          .includes(ext);
        return !isValidType;
      });

      if (invalidFiles.length > 0) {
        setError(
          `不支持的文件类型: ${invalidFiles.map((f) => f.name).join(", ")}`,
        );
        return;
      }

      const uploadFiles: UploadFile[] = newFiles.map((file) => ({
        id: generateUUID(),
        file,
        status: "pending",
        progress: 0,
        type: file.type.startsWith("image/") ? "image" : "model",
      }));

      const updatedFiles = [...files, ...uploadFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      setError("");
    },
    [files, onFilesChange],
  );

  const handleFileRemove = useCallback((fileId: string) => {
    setFileToRemove(fileId);
  }, []);

  // 监听文件列表变化，更新验证状态
  useEffect(() => {
    const isValid =
      files.length > 0 && !files.some((file) => file.status === "uploading");
    onValidityChange?.(isValid);
  }, [files, onValidityChange]);

  const totalSize = files.reduce((acc, file) => acc + file.file.size, 0);
  const isUploading = files.some((file) => file.status === "uploading");

  const modelFiles = files.filter((file) => file.type === "model");
  const imageFiles = files.filter((file) => file.type === "image");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          上传产品文件
        </h2>
        <p className="text-gray-600">
          支持上传 STL、STEP、IGS 格式的3D文件和 JPG、PNG、WebP
          格式的图片文件，最大支持100MB
        </p>
        <p className="text-sm text-red-500 font-medium">
          * 至少需要上传一个文件才能继续下一步
        </p>
      </div>

      <FileUploader
        onFilesAdded={handleFilesAdded}
        disabled={isUploading}
        accept={SUPPORTED_FORMATS}
        maxSize={MAX_FILE_SIZE}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length === 0 && (
        <Alert className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>请上传至少一个文件以继续</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-6">
          <div className="text-sm text-blue-600 font-medium">
            已上传 {files.length} 个文件，共{" "}
            {(totalSize / 1024 / 1024).toFixed(2)} MB
          </div>

          {modelFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                3D模型文件
              </h3>
              <FileList files={modelFiles} onRemove={handleFileRemove} />
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">图片文件</h3>
              <FileList files={imageFiles} onRemove={handleFileRemove} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
