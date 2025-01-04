"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUploader({
  onFilesAdded,
  disabled = false,
  accept,
  maxSize,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-10
        flex flex-col items-center justify-center
        cursor-pointer transition-all duration-300
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <Upload
        className={`w-12 h-12 mb-4 transition-colors duration-300 ${
          isDragActive ? "text-blue-500" : "text-gray-400"
        }`}
      />
      <p
        className={`text-center font-medium transition-colors duration-300 ${
          isDragActive ? "text-blue-600" : "text-gray-600"
        }`}
      >
        {isDragActive ? "放开以上传文件" : "拖拽文件到此处，或点击选择文件"}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        支持 STL、STEP、IGS 格式的3D文件和 JPG、PNG、WebP 格式的图片文件，最大
        100MB
      </p>
    </div>
  );
}
