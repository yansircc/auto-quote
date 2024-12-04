import type {
  ManifestResponse,
  PropertyResponse,
  PropertyQueryRequest,
  DerivativeRequest,
  TranslationJobResponse,
  ManifestChild,
} from "@/types/aps/types";
import type { BoundingBox, GeometryResponse } from "@/types/aps/geometry";
import { BaseAPSService } from "./base-service";
import { env } from "@/env.js";

const MAX_RETRIES = 30; // 最多等待30次
const RETRY_DELAY = 2000; // 每次等待2秒

export class DerivativeService extends BaseAPSService {
  constructor(
    clientId: string = env.FORGE_CLIENT_ID,
    clientSecret: string = env.FORGE_CLIENT_SECRET,
    scope = "data:read data:write data:create bucket:create bucket:read",
  ) {
    super(clientId, clientSecret, scope);
  }

  /**
   * Start translation job for a file
   */
  public async translateFile(urn: string): Promise<TranslationJobResponse> {
    console.log("\n=== Starting translation to SVF2 ===");
    console.log("URN:", urn);

    const body: DerivativeRequest = {
      input: {
        urn,
      },
      output: {
        destination: {
          region: "us",
        },
        formats: [
          {
            type: "svf2",
            views: ["2d", "3d"],
          },
        ],
      },
    };

    const response = await this.fetch(
      "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ads-force": "true", // 强制重新转换
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to start translation: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Translation job started successfully");
    console.log("Job result:", result);

    return result;
  }

  /**
   * Start OBJ translation job for specific objects
   */
  public async translateToObj(
    urn: string,
    modelGuid: string,
    objectIds: number[],
  ): Promise<TranslationJobResponse> {
    const body: DerivativeRequest = {
      input: {
        urn,
      },
      output: {
        destination: {
          region: "us",
        },
        formats: [
          {
            type: "obj",
            advanced: {
              modelGuid,
              objectIds,
            },
          },
        ],
      },
    };

    const response = await this.fetch(
      "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to start translation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get manifest for a file
   */
  public async getManifest(urn: string): Promise<ManifestResponse> {
    console.log("\n=== Getting manifest ===");
    console.log("URN:", urn);

    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get manifest: ${response.statusText}`);
    }

    const manifest = await response.json();
    console.log("Manifest status:", manifest.status);
    console.log("Manifest progress:", manifest.progress);

    return manifest;
  }

  /**
   * Get properties for a viewable
   */
  public async getProperties(
    urn: string,
    guid: string,
    query?: PropertyQueryRequest,
  ): Promise<PropertyResponse> {
    const url = new URL(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties`,
    );

    const response = await this.fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to get properties: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get geometry data from OBJ file
   */
  public async getGeometryData(
    urn: string,
    derivativeUrn: string,
  ): Promise<GeometryResponse> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${derivativeUrn}/geometry`,
    );

    if (!response.ok) {
      throw new Error(`Failed to get geometry data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 快速获取模型尺寸信息，不需要等待完整的 SVF2 转换
   */
  public async getModelDimensions(
    urn: string,
    modelGuid: string,
    objectIds: number[],
  ): Promise<BoundingBox> {
    // 1. 开始 OBJ 转换
    await this.translateToObj(urn, modelGuid, objectIds);

    // 2. 等待 OBJ 转换完成
    let retries = 0;
    let manifest: ManifestResponse;
    while (retries < MAX_RETRIES) {
      manifest = await this.getManifest(urn);
      const objDerivative = manifest.derivatives?.find(
        (d) => d.outputType === "obj" && d.status === "success",
      );

      if (objDerivative?.children) {
        const objFile = objDerivative.children.find(
          (c): c is ManifestChild & { urn: string } =>
            c.role === "obj" &&
            c.type === "resource" &&
            typeof c.urn === "string",
        );

        if (objFile?.urn) {
          // 3. 获取几何数据
          const geometryData = await this.getGeometryData(urn, objFile.urn);
          return geometryData.data.geometryData.boundingBox;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      retries++;
    }

    throw new Error("Timeout waiting for OBJ derivative");
  }
}
