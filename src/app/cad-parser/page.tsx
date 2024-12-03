"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { GeometryResponse } from "@/types/aps/geometry";

interface UploadResponse {
  success: boolean;
  data: {
    urn: string;
    status: string;
  };
  error?: string;
}

export default function CADParser() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeometryResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/parse-cad", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = (await uploadResponse.json()) as UploadResponse;

      if (!uploadData.success) {
        throw new Error(uploadData.error ?? "Upload failed");
      }

      // Step 2: Get geometry data
      const geometryResponse = await fetch(
        `/api/parse-cad/${uploadData.data.urn}`,
      );

      if (!geometryResponse.ok) {
        throw new Error("Failed to get geometry data");
      }

      const geometryData = (await geometryResponse.json()) as GeometryResponse;

      if (!geometryData.success) {
        throw new Error(geometryData.error ?? "Failed to process geometry");
      }

      setResult(geometryData.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">CAD File Parser</h1>

      <div className="mb-8 flex gap-4">
        <Input
          type="file"
          accept=".stp,.step,.igs,.iges,.obj"
          onChange={handleFileChange}
          disabled={loading}
        />
        <Button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Processing..." : "Upload & Parse"}
        </Button>
      </div>

      {error && <div className="mb-4 text-red-500">Error: {error}</div>}

      {result && (
        <Card className="p-4">
          <h2 className="mb-2 text-xl font-semibold">Results</h2>
          <pre className="max-h-[500px] overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
