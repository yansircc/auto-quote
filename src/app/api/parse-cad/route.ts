import { NextResponse } from "next/server";
import { DerivativeService } from "@/services/aps/derivative-service";
import { BucketService } from "@/services/aps/bucket-service";
import type { ManifestChild } from "@/types/aps/types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 },
      );
    }

    console.log("\n=== Uploading file ===");
    console.log("File name:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. 上传文件到 OSS 并获取 URN
    const bucketService = new BucketService();
    const urn = await bucketService.uploadAndGetUrn(buffer, file.name);

    const derivativeService = new DerivativeService();

    // 2. 转换成 SVF2
    await derivativeService.translateFile(urn);

    // 3. 等待转换完成，获取 manifest
    let retries = 0;
    const MAX_RETRIES = 30;
    const RETRY_DELAY = 2000;

    console.log("\n=== Waiting for SVF2 conversion ===");
    while (retries < MAX_RETRIES) {
      const manifest = await derivativeService.getManifest(urn);
      const svf2Derivative = manifest.derivatives?.find(
        (d) => d.outputType === "svf2" && d.status === "success",
      );

      if (svf2Derivative?.children) {
        const modelView = svf2Derivative.children.find(
          (c): c is ManifestChild & { guid: string } =>
            c.role === "3d" &&
            c.type === "geometry" &&
            typeof c.guid === "string",
        );

        if (modelView?.guid) {
          // 4. 获取属性
          console.log("\n=== Getting properties ===");
          console.log("Model GUID:", modelView.guid);
          const properties = await derivativeService.getProperties(urn, modelView.guid);
          const objectIds = properties.data.collection.map((item) => item.objectid);
          console.log("Found", objectIds.length, "objects");

          // 5. 转换成 OBJ
          console.log("\n=== Converting to OBJ ===");
          const translationJob = await derivativeService.translateToObj(
            urn,
            modelView.guid,
            objectIds,
          );
          console.log("OBJ translation job:", translationJob);

          return NextResponse.json({
            success: true,
            urn,
          });
        }
      }

      console.log(`Retry ${retries + 1}/${MAX_RETRIES}...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      retries++;
    }

    throw new Error("Timeout waiting for SVF2 derivative");
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
