import { APSService } from "./auth";

export interface UploadResponse {
  bucketKey: string;
  objectId: string;
  objectKey: string;
  sha1: string;
  size: number;
  location: string;
}

/**
 * Utility class for APS Object Storage Service operations
 */
export class StorageService {
  private static instance: StorageService;
  private apsService: APSService;

  private constructor() {
    this.apsService = APSService.getInstance();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Create a new bucket
   */
  private async createBucket(bucketKey: string): Promise<void> {
    const response = await this.apsService.fetch(
      "https://developer.api.autodesk.com/oss/v2/buckets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketKey,
          policyKey: "transient",
        }),
      },
    );

    if (!response.ok && response.status !== 409) {
      // 409 means bucket already exists, which is fine
      throw new Error(`Failed to create bucket: ${response.statusText}`);
    }
  }

  /**
   * Get a signed URL for uploading a file
   */
  private async getSignedUrl(
    bucketKey: string,
    objectKey: string,
  ): Promise<{ signedUrl: string; uploadKey: string }> {
    const response = await this.apsService.fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      urls: string[];
      uploadKey: string;
    };
    return {
      signedUrl: data.urls[0] ?? "",
      uploadKey: data.uploadKey,
    };
  }

  /**
   * Upload a file to OSS
   */
  public async uploadFile(
    bucketKey: string,
    objectKey: string,
    fileContent: ArrayBuffer,
  ): Promise<UploadResponse> {
    // Ensure bucket exists
    await this.createBucket(bucketKey);

    // Get signed URL
    const { signedUrl, uploadKey } = await this.getSignedUrl(
      bucketKey,
      objectKey,
    );

    // Upload file
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: fileContent,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    // Finalize upload
    const finalizeResponse = await this.apsService.fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadKey,
        }),
      },
    );

    if (!finalizeResponse.ok) {
      throw new Error(
        `Failed to finalize upload: ${finalizeResponse.statusText}`,
      );
    }

    return (await finalizeResponse.json()) as UploadResponse;
  }
}
