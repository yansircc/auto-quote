import { NextResponse } from "next/server";
import { DerivativeService } from "@/services/aps/derivative-service";

export async function GET(
  request: Request,
  { params }: { params: { urn: string } },
) {
  try {
    const { urn } = params;
    console.log("\n=== Processing URN ===");
    console.log(urn);

    const derivativeService = new DerivativeService();

    // Get manifest to check status
    const manifest = await derivativeService.getManifest(urn);
    console.log("Manifest:", manifest);

    if (manifest.status !== "success") {
      return NextResponse.json({
        success: false,
        data: {
          status: manifest.status,
          progress: manifest.progress,
        },
      });
    }

    // Find OBJ format data
    const objInfo = manifest.derivatives
      .flatMap((d) => d.children ?? [])
      .find((c) => c.role === "obj");

    if (!objInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "OBJ format not available",
        },
        { status: 404 },
      );
    }

    // Get geometry data
    const geometryData = await derivativeService.getGeometryData(
      urn,
      objInfo.guid,
    );

    // Return all data for debugging
    return NextResponse.json({
      success: true,
      data: {
        manifest,
        objInfo,
        geometryData,
      },
    });
  } catch (error) {
    console.error("Error processing CAD file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
