import { BaseAPSService } from "./base-service";
import type {
  ManifestResponse,
  PropertyResponse,
  PropertyQueryRequest,
  SignedCookiesWithCloudFront,
} from "@/types/aps/types";
import type { GeometryData } from "@/types/aps/geometry";
import { parseOBJContent, calculateBoundingBox } from "./obj-parser";

export interface TranslationJobResponse {
  jobId: string;
  urn: string;
  status: string;
}

export class DerivativeService extends BaseAPSService {
  constructor() {
    super();
  }

  /**
   * Start translation job for a file
   */
  public async translateFile(urn: string) {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/job`,
      {
        method: "POST",
        body: JSON.stringify({
          input: {
            urn,
          },
          output: {
            formats: [
              {
                type: "obj",
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to start translation: ${response.statusText}`);
    }

    return (await response.json()) as TranslationJobResponse;
  }

  /**
   * Get manifest for a file
   */
  public async getManifest(urn: string): Promise<ManifestResponse> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get manifest: ${response.statusText}`);
    }

    return (await response.json()) as ManifestResponse;
  }

  /**
   * Get properties for a viewable
   */
  public async getProperties(
    urn: string,
    guid: string,
  ): Promise<PropertyResponse> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get properties: ${response.statusText}`);
    }

    return (await response.json()) as PropertyResponse;
  }

  /**
   * Query specific properties
   */
  public async queryProperties(
    urn: string,
    guid: string,
    query: PropertyQueryRequest,
  ): Promise<PropertyResponse> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties:query`,
      {
        method: "POST",
        body: JSON.stringify(query),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to query properties: ${response.statusText}`);
    }

    return (await response.json()) as PropertyResponse;
  }

  /**
   * Get signed cookies for downloading OBJ file
   */
  public async getSignedCookies(
    urn: string,
    objUrn: string,
  ): Promise<SignedCookiesWithCloudFront> {
    const response = await this.fetch(
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
        const [cookieStr] = cookiePair.split(";");
        const [name, value] = cookieStr?.split("=") ?? [];
        if (name?.includes("CloudFront")) {
          cookies[name.trim()] = value?.trim() ?? "";
        }
      }
    }

    const data = (await response.json()) as SignedCookiesWithCloudFront;

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

    return {
      ...data,
      cookies: {
        "CloudFront-Key-Pair-Id": cookies["CloudFront-Key-Pair-Id"] ?? "",
        "CloudFront-Policy": cookies["CloudFront-Policy"] ?? "",
        "CloudFront-Signature": cookies["CloudFront-Signature"] ?? "",
      },
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
   * Get geometry data from OBJ file
   */
  public async getGeometryData(
    urn: string,
    objUrn: string,
  ): Promise<GeometryData> {
    const objFile = await this.downloadObj(urn, objUrn);
    const objContent = new TextDecoder().decode(objFile.data);
    const geometry = parseOBJContent(objContent);
    const boundingBox = calculateBoundingBox(geometry.vertices);

    if (!boundingBox) {
      throw new Error("Failed to calculate bounding box: no vertices found");
    }

    return {
      geometry,
      stats: {
        vertexCount: geometry.vertices.length,
        faceCount: geometry.faces.length,
        normalCount: geometry.normals.length,
        uvCount: geometry.uvs.length,
      },
      boundingBox,
    };
  }
}
