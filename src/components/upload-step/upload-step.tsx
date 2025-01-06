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
  onFilesChange?: (files: UploadFile[]) => void;
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

export default function UploadStep({
  onValidityChange,
  onFilesChange,
}: UploadStepProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string>("");

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
        id: crypto.randomUUID(),
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

  const handleFileRemove = useCallback(
    (fileId: string) => {
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file.id !== fileId);
        onFilesChange?.(updatedFiles);
        return updatedFiles;
      });
    },
    [onFilesChange],
  );

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">上传产品文件</h2>
        <p className="text-muted-foreground">
          支持上传 STL、STEP、IGS 格式的3D文件和 JPG、PNG、WebP
          格式的图片文件，最大支持100MB
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

      {files.length > 0 && (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            已上传 {files.length} 个文件，共{" "}
            {(totalSize / 1024 / 1024).toFixed(2)} MB
          </div>

          {modelFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">3D模型文件</h3>
              <FileList files={modelFiles} onRemove={handleFileRemove} />
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">图片文件</h3>
              <FileList files={imageFiles} onRemove={handleFileRemove} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
