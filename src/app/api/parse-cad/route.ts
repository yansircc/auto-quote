import { NextResponse } from "next/server";
import { APSService } from "../aps/service";
import { DerivativeService } from "../aps/derivative";
import type {
  PropertyResponse,
  PropertyQueryRequest,
  ManifestResponse,
  ManifestDerivative,
} from "../aps/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    console.log("\n=== Uploading file ===");
    console.log("File name:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);

    // Initialize services
    const apsService = new APSService();
    const derivativeService = new DerivativeService(apsService);

    // Upload the file to APS
    const urn = await apsService.uploadFile(file);
    console.log("Uploaded file URN:", urn);

    // Start translation job
    const translationJob = await derivativeService.translateFile(urn);
    console.log("Translation Job:", translationJob);

    return NextResponse.json({
      success: true,
      data: {
        urn,
        status: translationJob.status,
      },
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      {
        status: 500,
      },
    );
  }
}

interface Viewable {
  guid: string;
  role: string;
  mime: string;
  status: string;
  progress: string;
  hasThumbnail: boolean;
  name: string;
  camera: unknown[];
  resolution: unknown[];
}

function findViewables(derivatives: ManifestDerivative[]): Viewable[] {
  const viewables: Viewable[] = [];
  for (const derivative of derivatives) {
    if (derivative.children) {
      for (const child of derivative.children) {
        if (child.role === "2d" || child.role === "3d") {
          viewables.push(child as Viewable);
        }
      }
    }
  }
  return viewables;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get("urn");

    if (!urn) {
      return new Response("No URN provided", { status: 400 });
    }

    // Initialize services
    const apsService = new APSService();
    const derivativeService = new DerivativeService(apsService);

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

    // Find viewables
    const viewables = findViewables(manifest.derivatives);
    console.log("Viewables:", viewables);

    // Get properties for the first 3D viewable
    const threeDViewable = viewables.find((v: Viewable) => v.role === "3d");
    if (!threeDViewable) {
      return new Response("No 3D viewable found", { status: 404 });
    }

    // Get properties
    const propertyResponse = await derivativeService.getProperties(
      urn,
      threeDViewable.guid,
    );

    return NextResponse.json({
      success: true,
      data: {
        status: manifest.status,
        progress: manifest.progress,
        properties: propertyResponse,
      },
    });
  } catch (error) {
    console.error("Error getting properties:", error);
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      {
        status: 500,
      },
    );
  }
}
