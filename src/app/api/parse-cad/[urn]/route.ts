import { NextResponse } from "next/server";
import { APSService } from "../../aps/auth";
import { DerivativeService } from "../../aps/derivative";
import type { PropertyCollection } from "../../aps/derivative";

export const dynamic = "force-dynamic";

interface FileProperties {
  Title?: string;
  "Original System"?: string;
  Preprocessor?: string;
  "Creation Date"?: string;
  Description?: string;
  "Part Number"?: string;
  Revision?: string;
}

interface GeneralProperties {
  Layer?: string;
}

interface GeometricData {
  objectid: number;
  name?: string;
  properties: {
    name?: string;
    appearance?: string;
    componentName?: string;
    fileProperties?: FileProperties;
    identityData: Record<string, unknown>;
    dimensions: Record<string, unknown>;
    physical: Record<string, unknown>;
    graphics: Record<string, unknown>;
    other?: {
      General?: GeneralProperties;
      [key: string]: unknown;
    };
    raw: {
      Name?: string;
      Appearance?: string;
      "Component Name"?: string;
      "File Properties"?: FileProperties;
      General?: GeneralProperties;
      [key: string]: unknown;
    };
    metadata: {
      externalId?: string;
      propertyDb?: string | null;
    };
  };
}

export async function GET(
  request: Request,
  { params }: { params: { urn: string } },
) {
  try {
    const apsService = APSService.getInstance();
    const derivativeService = new DerivativeService(apsService);

    const { urn } = await Promise.resolve(params);
    console.log("\n=== Processing URN ===");
    console.log(urn);

    // Get manifest first to check status
    const manifest = await derivativeService.getManifest(urn);
    if (manifest.status !== "success") {
      return new Response(
        JSON.stringify({
          error: `Model is not ready: ${manifest.status} (${manifest.progress})`,
        }),
        { status: 400 },
      );
    }

    // Get viewables
    const viewables = await derivativeService.getViewables(urn);
    console.log("\n=== Viewables ===");
    console.log(viewables);

    // Get properties for the first 3D viewable
    const threeDViewable = viewables.find((v) => v.role === "3d");
    if (!threeDViewable) {
      return new Response("No 3D viewable found", { status: 404 });
    }

    // Get object tree
    const objectTree = await derivativeService.getObjectTree(
      urn,
      threeDViewable.guid,
    );
    console.log("\n=== Object Tree ===");
    console.log(JSON.stringify(objectTree, null, 2));

    // Get all properties
    const properties = await derivativeService.getProperties(
      urn,
      threeDViewable.guid,
    );
    console.log("\n=== Properties ===");
    console.log(JSON.stringify(properties.data.collection, null, 2));

    // Extract geometry for specific objects
    let geometryJob;
    let objInfo = null;
    try {
      // Find the FILLET9 object and other solid objects
      const targetObjects = properties.data.collection.filter(
        (item) => item.name?.includes("FILLET") ?? item.name?.includes("Solid"),
      );

      if (targetObjects.length > 0) {
        // Start geometry extraction
        geometryJob = await derivativeService.extractGeometry(
          urn,
          threeDViewable.guid,
          targetObjects.map((item) => item.objectid),
        );
        console.log("\n=== Geometry Extraction Job ===");
        console.log(
          "Extracting geometry for objects:",
          targetObjects.map((item) => item.name),
        );
        console.log(JSON.stringify(geometryJob, null, 2));

        // Wait for OBJ translation to complete
        console.log("\n=== Waiting for OBJ Translation ===");
        const objDerivative =
          await derivativeService.waitForObjTranslation(urn);

        if (objDerivative) {
          // Get OBJ file information
          objInfo = await derivativeService.getObjDownloadInfo(
            urn,
            objDerivative,
          );
          console.log("\n=== OBJ File Information ===");
          console.log(JSON.stringify(objInfo, null, 2));

          // Get signed cookies for download
          const signedCookies = await derivativeService.getSignedCookies(
            urn,
            objInfo.objUrn,
          );
          console.log("\n=== Download Information ===");
          console.log(JSON.stringify(signedCookies, null, 2));

          // Try to download the OBJ file
          console.log("\n=== Downloading OBJ File ===");
          const objFile = await derivativeService.downloadObj(
            urn,
            objInfo.objUrn,
          );
          console.log("OBJ file size:", objFile.data.byteLength, "bytes");

          // Add download info to objInfo
          objInfo = {
            ...objInfo,
            downloadUrl: signedCookies.url,
            size: signedCookies.size,
            contentType: signedCookies["content-type"],
            expiration: signedCookies.expiration,
            fileSize: objFile.data.byteLength,
          };
        }
      } else {
        console.log("No suitable objects found for geometry extraction");
      }
    } catch (error) {
      console.warn("Failed to extract geometry:", error);
      if (error instanceof Error) {
        console.warn("Error details:", error.message);
      }
    }

    // Map the properties
    const geometricData: GeometricData[] = properties.data.collection.map(
      (item: PropertyCollection) => {
        const allProperties = item.properties || {};

        // Initialize empty categories
        const identityData: Record<string, unknown> = {};
        const dimensions: Record<string, unknown> = {};
        const physical: Record<string, unknown> = {};
        const graphics: Record<string, unknown> = {};

        // Collect other properties
        const otherProps: Record<string, unknown> = {};
        Object.entries(allProperties).forEach(([key, value]) => {
          if (
            ![
              "Name",
              "Appearance",
              "Component Name",
              "File Properties",
            ].includes(key)
          ) {
            otherProps[key] = value;
          }
        });

        return {
          objectid: item.objectid,
          name: item.name,
          properties: {
            name: allProperties.Name as string | undefined,
            appearance: allProperties.Appearance as string | undefined,
            componentName: allProperties["Component Name"] as
              | string
              | undefined,
            fileProperties: allProperties["File Properties"] as
              | FileProperties
              | undefined,
            identityData,
            dimensions,
            physical,
            graphics,
            other: Object.keys(otherProps).length > 0 ? otherProps : undefined,
            raw: allProperties,
            metadata: {
              externalId: item.externalId,
              propertyDb: derivativeService.getPropertyDbPath(manifest),
            },
          },
        };
      },
    );

    if (objInfo) {
      const geometryData = await derivativeService.getGeometryData(
        urn,
        objInfo.objUrn,
      );

      return NextResponse.json({
        success: true,
        data: {
          ...objInfo,
          geometry: {
            stats: geometryData.stats,
            boundingBox: calculateBoundingBox(geometryData.geometry.vertices),
          },
        },
      });
    }

    return new Response(
      JSON.stringify(
        {
          viewables,
          objectTree,
          geometricData,
          geometryJob,
          objInfo,
          targetObjects: properties.data.collection
            .filter(
              (item) =>
                item.name?.includes("FILLET") ?? item.name?.includes("Solid"),
            )
            .map((item) => ({
              id: item.objectid,
              name: item.name,
            })),
          rawProperties: properties.data.collection,
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching model data:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

function calculateBoundingBox(vertices: { x: number; y: number; z: number }[]) {
  if (vertices.length === 0) {
    return null;
  }

  const bounds = {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
  };

  for (const vertex of vertices) {
    bounds.min.x = Math.min(bounds.min.x, vertex.x);
    bounds.min.y = Math.min(bounds.min.y, vertex.y);
    bounds.min.z = Math.min(bounds.min.z, vertex.z);
    bounds.max.x = Math.max(bounds.max.x, vertex.x);
    bounds.max.y = Math.max(bounds.max.y, vertex.y);
    bounds.max.z = Math.max(bounds.max.z, vertex.z);
  }

  return {
    ...bounds,
    dimensions: {
      x: bounds.max.x - bounds.min.x,
      y: bounds.max.y - bounds.min.y,
      z: bounds.max.z - bounds.min.z,
    },
  };
}
