export interface SignedCookiesResponse {
  url: string;
  "content-type": string;
  size: number;
  expiration: number;
}

export interface CloudFrontCookies {
  "CloudFront-Key-Pair-Id": string;
  "CloudFront-Policy": string;
  "CloudFront-Signature": string;
}

export interface SignedCookiesWithCloudFront extends SignedCookiesResponse {
  cookies: CloudFrontCookies;
}

export interface ManifestDerivative {
  hasThumbnail?: boolean;
  children?: Array<{
    guid: string;
    mime: string;
    role: string;
    status: string;
    progress: string;
    hasThumbnail: boolean;
    name?: string;
  }>;
}

export interface ManifestResponse {
  status: string;
  progress: string;
  derivatives: ManifestDerivative[];
}

export interface PropertyResponse {
  data: {
    collection: Array<{
      objectid: number;
      name: string;
      properties: Record<string, unknown>;
    }>;
  };
}

export interface PropertyQueryRequest {
  query: {
    $contains?: string[];
    $like?: string[];
  };
}
