import { APSService } from "./auth";

export interface TranslationJob {
  result: string;
  urn: string;
  acceptedJobs: {
    output: {
      formats: Array<{
        type: string;
        views: string[];
      }>;
    };
  };
}

export interface ObjTranslationJob {
  result: string;
  urn: string;
  acceptedJobs: {
    output: {
      destination: {
        region: string;
      };
      formats: Array<{
        type: string;
        advanced: {
          modelGuid: string;
          objectIds: number[];
        };
      }>;
    };
  };
}

export interface SignedCookiesResponse {
  url: string;
  "content-type": string;
  size: number;
  expiration: number;
}

export interface ViewableData {
  name: string;
  role: string;
  guid: string;
}

export interface ObjectNode {
  objectid: number;
  name?: string;
  objects?: ObjectNode[];
}

export interface PropertyCollection {
  objectid: number;
  name?: string;
  externalId?: string;
  properties: Record<string, unknown>;
}

export interface PropertyResponse {
  data: {
    type: string;
    collection: PropertyCollection[];
  };
}

export interface PropertyQueryRequest {
  query?: {
    $prefix?: [string, string];
  };
  fields?: string[];
  pagination?: {
    offset: number;
    limit: number;
  };
  payload?: "text";
}

interface ObjDerivative {
  hasThumbnail: string;
  children: Array<{
    modelGuid: string;
    urn: string;
    role: string;
    guid: string;
    type: string;
    objectIds: number[];
    status: string;
  }>;
  progress: string;
  outputType: string;
  status: string;
}

interface ManifestDerivative {
  name: string;
  hasThumbnail: string;
  status: string;
  progress: string;
  outputType: string;
  children?: Array<{
    modelGuid?: string;
    urn?: string;
    role: string;
    guid: string;
    type: string;
    objectIds?: number[];
    status: string;
  }>;
}

interface Manifest {
  type: string;
  hasThumbnail: string;
  status: string;
  progress: string;
  region: string;
  urn: string;
  version: string;
  derivatives: ManifestDerivative[];
}

interface CloudFrontCookies {
  "CloudFront-Key-Pair-Id": string;
  "CloudFront-Policy": string;
  "CloudFront-Signature": string;
}

interface SignedCookiesWithCloudFront extends SignedCookiesResponse {
  cookies: CloudFrontCookies;
}

// Add OBJ geometry types
interface OBJVertex {
  x: number;
  y: number;
  z: number;
}

interface OBJFace {
  vertices: number[]; // Indices into vertices array
  normals?: number[]; // Indices into normals array
  uvs?: number[]; // Indices into uvs array
}

interface OBJGeometry {
  vertices: OBJVertex[];
  normals: OBJVertex[];
  uvs: { u: number; v: number }[];
  faces: OBJFace[];
}

/**
 * Utility class for APS Model Derivative operations
 */
export class DerivativeService {
  private apsService: APSService;

  constructor(apsService: APSService) {
    this.apsService = apsService;
  }

  /**
   * Start a translation job
   */
  public async translateFile(urn: string): Promise<TranslationJob> {
    const response = await this.apsService.fetch(
      "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ads-force": "true",
        },
        body: JSON.stringify({
          input: {
            urn,
          },
          output: {
            formats: [
              {
                type: "svf2",
                views: ["2d", "3d"],
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to start translation: ${response.statusText}`);
    }

    const data = (await response.json()) as TranslationJob;
    return data;
  }

  /**
   * Check translation status
   */
  public async getManifest(urn: string): Promise<Manifest> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get manifest: ${response.statusText}`);
    }

    const data = (await response.json()) as Manifest;
    return data;
  }

  /**
   * Get viewables metadata
   */
  public async getViewables(urn: string): Promise<ViewableData[]> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get viewables: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      data: { metadata: ViewableData[] };
    };
    return data.data.metadata;
  }

  /**
   * Get object tree for a specific viewable
   */
  public async getObjectTree(urn: string, guid: string): Promise<ObjectNode[]> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get object tree: ${response.statusText}`);
    }

    const data = (await response.json()) as { data: { objects: ObjectNode[] } };
    return data.data.objects;
  }

  /**
   * Get all properties for a specific viewable
   */
  public async getProperties(
    urn: string,
    guid: string,
  ): Promise<PropertyResponse> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get properties: ${response.statusText}`);
    }

    const data = (await response.json()) as PropertyResponse;
    return data;
  }

  /**
   * Query specific properties for a viewable
   */
  public async queryProperties(
    urn: string,
    guid: string,
    query: PropertyQueryRequest,
  ): Promise<PropertyResponse> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties:query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to query properties: ${response.statusText}`);
    }

    const data = (await response.json()) as PropertyResponse;
    return data;
  }

  /**
   * Get property database path from manifest
   */
  public getPropertyDbPath(manifest: Manifest): string | null {
    for (const derivative of manifest.derivatives) {
      if (derivative.outputType === "svf2" && derivative.children) {
        for (const child of derivative.children) {
          if (child.role === "Autodesk.CloudPlatform.PropertyDatabase") {
            return child.urn ?? null;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract geometry as OBJ format
   */
  public async extractGeometry(
    urn: string,
    modelGuid: string,
    objectIds: number[],
  ): Promise<ObjTranslationJob> {
    const response = await this.apsService.fetch(
      "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ads-force": "true",
        },
        body: JSON.stringify({
          input: {
            urn: urn,
          },
          output: {
            destination: {
              region: "us",
            },
            formats: [
              {
                type: "obj",
                advanced: {
                  modelGuid: modelGuid,
                  objectIds: objectIds,
                },
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to extract geometry: ${response.statusText}`);
    }

    const data = (await response.json()) as ObjTranslationJob;
    return data;
  }

  /**
   * Get signed cookies for downloading OBJ file
   */
  public async getSignedCookies(
    urn: string,
    objUrn: string,
  ): Promise<SignedCookiesWithCloudFront> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest/${objUrn}/signedcookies`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed cookies: ${response.statusText}`);
    }

    // Extract cookies from response headers
    const cookies: Record<string, string> = {};
    const setCookieHeader = response.headers.get("set-cookie");

    if (setCookieHeader) {
      const cookiePairs = setCookieHeader.split(",").map((pair) => pair.trim());
      for (const cookiePair of cookiePairs) {
        const cookieStrMatch = cookiePair.split(";")[0];
        if (!cookieStrMatch) continue;

        const [nameRaw, valueRaw] = cookieStrMatch.split("=");
        if (!nameRaw || !valueRaw) continue;

        const name = nameRaw.trim();
        const value = valueRaw.trim();

        if (name.includes("CloudFront")) {
          cookies[name] = value;
        }
      }
    }

    const data = (await response.json()) as SignedCookiesResponse;

    // Check if we have all required CloudFront cookies
    const requiredCookies = [
      "CloudFront-Key-Pair-Id",
      "CloudFront-Policy",
      "CloudFront-Signature",
    ] as const;

    const missingCookies = requiredCookies.filter((name) => !cookies[name]);
    if (missingCookies.length > 0) {
      console.warn("Missing required cookies:", missingCookies);
      console.warn("Available cookies:", cookies);
      console.warn(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );
      throw new Error(
        `Missing required CloudFront cookies: ${missingCookies.join(", ")}`,
      );
    }

    // At this point we know all required cookies exist
    const cloudFrontCookies: CloudFrontCookies = {
      "CloudFront-Key-Pair-Id": cookies["CloudFront-Key-Pair-Id"]!,
      "CloudFront-Policy": cookies["CloudFront-Policy"]!,
      "CloudFront-Signature": cookies["CloudFront-Signature"]!,
    };

    return {
      ...data,
      cookies: cloudFrontCookies,
    };
  }

  /**
   * Find OBJ derivative from manifest
   */
  private findObjDerivative(manifest: Manifest): ObjDerivative | null {
    const derivative = manifest.derivatives?.find(
      (d) => d.outputType === "obj",
    );
    if (!derivative?.children) return null;

    return {
      hasThumbnail: derivative.hasThumbnail,
      children: derivative.children.filter(
        (
          child,
        ): child is NonNullable<typeof child> & {
          modelGuid: string;
          urn: string;
          objectIds: number[];
        } => {
          return !!child.modelGuid && !!child.urn && !!child.objectIds;
        },
      ),
      progress: derivative.progress,
      outputType: derivative.outputType,
      status: derivative.status,
    };
  }

  /**
   * Wait for OBJ translation to complete
   */
  public async waitForObjTranslation(
    urn: string,
    timeoutMs = 60000,
    intervalMs = 2000,
  ): Promise<ObjDerivative | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const manifest = await this.getManifest(urn);
      const objDerivative = this.findObjDerivative(manifest);

      if (objDerivative?.status === "success") {
        return objDerivative;
      } else if (objDerivative?.status === "failed") {
        throw new Error("OBJ translation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("OBJ translation timeout");
  }

  /**
   * Get OBJ file download information
   */
  public async getObjDownloadInfo(
    urn: string,
    objDerivative: ObjDerivative,
  ): Promise<{
    objUrn: string;
    mtlUrn: string | null;
  }> {
    // Find OBJ and MTL files
    const objFile = objDerivative.children.find((c) => c.urn.endsWith(".obj"));
    const mtlFile = objDerivative.children.find((c) => c.urn.endsWith(".mtl"));

    if (!objFile) {
      throw new Error("OBJ file not found in derivative");
    }

    return {
      objUrn: objFile.urn,
      mtlUrn: mtlFile?.urn ?? null,
    };
  }

  /**
   * Download OBJ file
   */
  public async downloadObj(
    urn: string,
    objUrn: string,
  ): Promise<{
    data: ArrayBuffer;
    contentType: string;
  }> {
    // Get signed cookies first
    const signedCookies = await this.getSignedCookies(urn, objUrn);

    if (!signedCookies.cookies) {
      throw new Error("Failed to get CloudFront signed cookies");
    }

    // Format cookies for request
    const cookieStr = Object.entries(signedCookies.cookies)
      .filter(([_, value]) => value) // Only include cookies that have values
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");

    if (!cookieStr) {
      throw new Error("No valid CloudFront cookies found");
    }

    console.log("Using cookies:", cookieStr);

    // Download the file
    const response = await fetch(signedCookies.url, {
      headers: {
        Cookie: cookieStr,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download OBJ file: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    return {
      data,
      contentType: signedCookies["content-type"],
    };
  }

  /**
   * Parse OBJ file content into geometry data
   */
  private parseOBJContent(objContent: string): OBJGeometry {
    const geometry: OBJGeometry = {
      vertices: [],
      normals: [],
      uvs: [],
      faces: [],
    };

    const lines = objContent.split("\n");

    for (const line of lines) {
      const tokens = line.trim().split(/\s+/);
      if (tokens.length === 0) continue;

      const [type, ...values] = tokens;

      switch (type) {
        case "v": // Vertex
          if (values.length >= 3) {
            geometry.vertices.push({
              x: parseFloat(values[0]),
              y: parseFloat(values[1]),
              z: parseFloat(values[2]),
            });
          }
          break;

        case "vn": // Normal
          if (values.length >= 3) {
            geometry.normals.push({
              x: parseFloat(values[0]),
              y: parseFloat(values[1]),
              z: parseFloat(values[2]),
            });
          }
          break;

        case "vt": // Texture coordinate
          if (values.length >= 2) {
            geometry.uvs.push({
              u: parseFloat(values[0]),
              v: parseFloat(values[1]),
            });
          }
          break;

        case "f": // Face
          if (values.length >= 3) {
            const face: OBJFace = {
              vertices: [],
              normals: [],
              uvs: [],
            };

            // Process each vertex of the face
            for (const value of values) {
              const [vertexIndex, uvIndex, normalIndex] = value
                .split("/")
                .map((v) => (v ? parseInt(v) - 1 : undefined));

              if (typeof vertexIndex === "number") {
                face.vertices.push(vertexIndex);
                if (typeof uvIndex === "number") face.uvs?.push(uvIndex);
                if (typeof normalIndex === "number")
                  face.normals?.push(normalIndex);
              }
            }

            geometry.faces.push(face);
          }
          break;
      }
    }

    return geometry;
  }

  /**
   * Get geometry data from OBJ file
   */
  public async getGeometryData(
    urn: string,
    objUrn: string,
  ): Promise<{
    geometry: OBJGeometry;
    stats: {
      vertexCount: number;
      faceCount: number;
      normalCount: number;
      uvCount: number;
    };
  }> {
    const objFile = await this.downloadObj(urn, objUrn);
    const objContent = new TextDecoder().decode(objFile.data);
    const geometry = this.parseOBJContent(objContent);

    return {
      geometry,
      stats: {
        vertexCount: geometry.vertices.length,
        faceCount: geometry.faces.length,
        normalCount: geometry.normals.length,
        uvCount: geometry.uvs.length,
      },
    };
  }
}
