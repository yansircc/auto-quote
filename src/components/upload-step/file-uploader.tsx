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

  // const onDrop = useCallback(acceptedFiles => {
  //   // Do something with the files
  // }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept,
    maxSize,
  });

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   disabled,
  //   accept,
  //   maxSize,
  // });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center
        cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-center text-muted-foreground">
        {isDragActive ? "放开以上传文件" : "拖拽文件到此处，或点击选择文件"}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        支持 STL、STEP、IGS 格式的3D文件和 JPG、PNG、WebP 格式的图片文件，最大
        100MB
      </p>
    </div>
  );
}
