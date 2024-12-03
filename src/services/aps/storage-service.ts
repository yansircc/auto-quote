import { BaseAPSService } from "./base-service";

export interface BucketResponse {
  bucketKey: string;
  bucketOwner: string;
  createdDate: number;
  policyKey: string;
}

export interface ObjectResponse {
  bucketKey: string;
  objectId: string;
  objectKey: string;
  sha1: string;
  size: number;
  location: string;
}

export class StorageService extends BaseAPSService {
  constructor() {
    super();
  }

  /**
   * Create a new bucket
   */
  public async createBucket(bucketKey: string): Promise<BucketResponse> {
    const response = await this.fetch(
      "https://developer.api.autodesk.com/oss/v2/buckets",
      {
        method: "POST",
        body: JSON.stringify({
          bucketKey,
          policyKey: "transient", // Delete after 24 hours
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create bucket: ${response.statusText}`);
    }

    return (await response.json()) as BucketResponse;
  }

  /**
   * Upload a file to a bucket
   */
  public async uploadFile(
    bucketKey: string,
    objectKey: string,
    data: ArrayBuffer,
  ): Promise<ObjectResponse> {
    // Create bucket first (will fail if it already exists)
    try {
      await this.createBucket(bucketKey);
    } catch (error) {
      console.log("Bucket might already exist:", error);
    }

    // Upload the file
    const response = await this.fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return (await response.json()) as ObjectResponse;
  }

  /**
   * Upload a file and return its base64 URN
   */
  public async uploadFileAndGetUrn(file: File): Promise<string> {
    // Generate a unique bucket key and object key
    const timestamp = Date.now();
    const bucketKey = `auto_quote_${timestamp}`.toLowerCase();
    const objectKey = file.name;

    // Upload file to OSS
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await this.uploadFile(
      bucketKey,
      objectKey,
      fileBuffer,
    );

    // Get base64 encoded URN
    return Buffer.from(uploadResponse.objectId).toString("base64");
  }
}
