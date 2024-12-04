import { NextResponse } from "next/server";
import { DerivativeService } from "@/services/aps/derivative-service";
import type { ManifestChild } from "@/types/aps/types";

const MAX_RETRIES = 30; // 最多等待30次
const RETRY_DELAY = 2000; // 每次等待2秒

async function waitForObjDerivative(
  service: DerivativeService,
  urn: string,
): Promise<ManifestChild | null> {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    const manifest = await service.getManifest(urn);
    const objDerivative = manifest.derivatives?.find(d => 
      d.outputType === "obj" && d.status === "success"
    );
    
    if (objDerivative?.children) {
      const objFile = objDerivative.children.find(
        (c): c is ManifestChild & { urn: string } =>
          c.role === "obj" && 
          c.type === "resource" && 
          typeof c.urn === "string"
      );
      
      if (objFile) {
        return objFile;
      }
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    retries++;
  }

  return null;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ urn: string }> },
): Promise<NextResponse> {
  const params = await props.params;
  try {
    const { urn } = params;
    console.log("\n=== Processing URN ===");
    console.log(urn);

    const derivativeService = new DerivativeService();

    // 等待 OBJ 转换完成
    console.log("\n=== Waiting for OBJ Conversion ===");
    const objFile = await waitForObjDerivative(derivativeService, urn);
    
    if (!objFile?.urn) {
      return NextResponse.json(
        {
          success: false,
          error: "OBJ file not found or conversion failed",
        },
        { status: 404 },
      );
    }

    // 获取几何数据
    const geometryData = await derivativeService.getGeometryData(urn, objFile.urn);

    return NextResponse.json({
      success: true,
      data: {
        dimensions: geometryData.data.geometryData.boundingBox,
      },
    });
  } catch (error) {
    console.error("Error processing URN:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
