import { NextResponse } from "next/server";
import { StorageService } from "@/services/aps/storage-service";
import { DerivativeService } from "@/services/aps/derivative-service";

export async function POST(request: Request) {
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

    // Initialize services
    const storageService = new StorageService();
    const derivativeService = new DerivativeService();

    // Upload the file to APS
    const urn = await storageService.uploadFileAndGetUrn(file);
    console.log("Uploaded file URN:", urn);

    // Start translation job
    const translationJob = await derivativeService.translateFile(urn);
    console.log("Translation Job:", translationJob);

    return NextResponse.json({
      success: true,
      data: {
        urn,
        status: translationJob.status ?? "pending",
      },
    });
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
