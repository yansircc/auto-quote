"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadFile } from "@/types/user-guide/upload";
import Image from "next/image";
import { useCallback } from "react";

interface FileListProps {
  files: UploadFile[];
  onRemove: (fileId: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  const getFileIcon = useCallback((file: UploadFile) => {
    if (file.type === "image") {
      return (
        <div className="w-8 h-8 relative rounded overflow-hidden">
          <Image
            src={URL.createObjectURL(file.file)}
            alt={file.file.name}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    const ext = file.file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "stl":
        return "📐";
      case "step":
      case "stp":
        return "📏";
      case "igs":
        return "📊";
      default:
        return "📄";
    }
  }, []);

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <span className="text-2xl">{getFileIcon(file)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {file.file.name}
              </p>
              <p className="text-xs text-blue-600">
                {(file.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {file.status === "uploading" && (
            <Progress value={file.progress} className="w-24 mx-4 bg-blue-100" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              onRemove(file.id);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
