import { BaseAPSService } from "./base-service";
import { env } from "@/env.js";

interface CreateBucketResponse {
  bucketKey: string;
  bucketOwner: string;
  createdDate: number;
  permissions: Array<{
    authId: string;
    access: string;
  }>;
  policyKey: string;
}

interface SignedUrlResponse {
  uploadKey: string;
  uploadExpiration: string;
  urlExpiration: string;
  urls: string[];
  location: string;
}

interface ObjectDetails {
  bucketKey: string;
  objectId: string;
  objectKey: string;
  sha1: string;
  size: number;
  location: string;
}

export class BucketService extends BaseAPSService {
  constructor(
    clientId: string = env.FORGE_CLIENT_ID,
    clientSecret: string = env.FORGE_CLIENT_SECRET,
    scope = "data:read data:write data:create bucket:create bucket:read",
  ) {
    super(clientId, clientSecret, scope);
  }

  /**
   * Create a new bucket
   */
  public async createBucket(bucketKey: string): Promise<CreateBucketResponse> {
    const response = await this.fetch(
      "https://developer.api.autodesk.com/oss/v2/buckets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ads-region": "US",
        },
        body: JSON.stringify({
          bucketKey,
          access: "full",
          policyKey: "transient",
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 409) {
        // Bucket already exists, that's fine
        return {
          bucketKey,
          bucketOwner: "",
          createdDate: 0,
          permissions: [],
          policyKey: "transient",
        };
      }
      throw new Error(`Failed to create bucket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a signed URL for uploading a file
   */
  public async getSignedUrl(
    bucketKey: string,
    objectKey: string,
    minutesExpiration = 10,
  ): Promise<SignedUrlResponse> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload?minutesExpiration=${minutesExpiration}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a file using a signed URL
   */
  public async uploadFile(signedUrl: string, buffer: Buffer): Promise<void> {
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }

  /**
   * Finalize an upload
   */
  public async finalizeUpload(
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
  ): Promise<ObjectDetails> {
    const response = await this.fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
      {
        method: "POST",
        body: JSON.stringify({
          ossbucketKey: bucketKey,
          ossSourceFileObjectKey: objectKey,
          access: "full",
          uploadKey,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to finalize upload: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a file to OSS and return its URN
   */
  public async uploadAndGetUrn(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    // 1. Create a bucket with a unique name
    const bucketKey = `moldall_${Date.now()}`;
    console.log("\n=== Creating bucket ===");
    console.log("Bucket key:", bucketKey);
    await this.createBucket(bucketKey);
    console.log("Bucket created successfully");

    // 2. Get signed URL
    console.log("\n=== Getting signed URL ===");
    const { uploadKey, urls } = await this.getSignedUrl(bucketKey, fileName);
    if (!urls.length) {
      throw new Error("No upload URL returned");
    }
    console.log("Got signed URL successfully");

    // 3. Upload the file
    console.log("\n=== Uploading to OSS ===");
    await this.uploadFile(urls[0], buffer);
    console.log("File uploaded successfully");

    // 4. Finalize the upload
    console.log("\n=== Finalizing upload ===");
    const details = await this.finalizeUpload(bucketKey, fileName, uploadKey);
    console.log("Upload finalized successfully");
    console.log("Object ID:", details.objectId);

    // 5. Get URN (base64 encoded objectId)
    const urn = Buffer.from(details.objectId).toString("base64");
    console.log("Base64 encoded URN:", urn);

    return urn;
  }
}
