import { NextResponse } from "next/server";
import { Readable } from "stream";

// APS API endpoints
const APS_BASE_URL = "https://developer.api.autodesk.com";
const TOKEN_URL = `${APS_BASE_URL}/authentication/v2/token`;
const BUCKET_URL = `${APS_BASE_URL}/oss/v2/buckets`;

// 验证环境变量
const APS_CLIENT_ID = process.env.APS_CLIENT_ID;
const APS_CLIENT_SECRET = process.env.APS_CLIENT_SECRET;
const APS_BUCKET = process.env.APS_BUCKET;

if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_BUCKET) {
  throw new Error("Missing required APS environment variables");
}

interface APSTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface APSUploadResponse {
  objectId: string;
  bucketKey: string;
  objectKey: string;
  sha1: string;
  size: number;
  contentType: string;
  location: string;
}

// 获取访问令牌
async function getAccessToken(): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: APS_CLIENT_ID!,
      client_secret: APS_CLIENT_SECRET!,
      grant_type: "client_credentials",
      scope: "data:write data:read bucket:read bucket:create",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = (await response.json()) as APSTokenResponse;
  return data.access_token;
}

// 确保 bucket 存在
async function ensureBucketExists(accessToken: string): Promise<void> {
  try {
    // 检查 bucket 是否存在
    const response = await fetch(`${BUCKET_URL}/${APS_BUCKET}/details`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return; // bucket 已存在
    }

    // 创建新的 bucket
    const createResponse = await fetch(BUCKET_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketKey: APS_BUCKET,
        policyKey: "transient", // 临时存储，30天后自动删除
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create bucket");
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    throw error;
  }
}

// 上传文件到 OSS
async function uploadToOSS(
  accessToken: string,
  file: File,
  objectKey: string,
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const readable = new Readable({
    read() {
      this.push(Buffer.from(buffer));
      this.push(null);
    },
  });

  const response = await fetch(
    `${BUCKET_URL}/${APS_BUCKET}/objects/${objectKey}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: readable as unknown as BodyInit,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload file to OSS");
  }

  const data = (await response.json()) as APSUploadResponse;
  return btoa(data.objectId);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("fileToUpload") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. 获取访问令牌
    const accessToken = await getAccessToken();

    // 2. 确保 bucket 存在
    await ensureBucketExists(accessToken);

    // 3. 生成唯一的对象键
    const timestamp = Date.now();
    const objectKey = `${timestamp}_${file.name}`;

    // 4. 上传文件并获取 URN
    const urn = await uploadToOSS(accessToken, file, objectKey);

    return NextResponse.json({ urn });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
