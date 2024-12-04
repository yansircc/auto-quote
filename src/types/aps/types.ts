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

export interface ManifestChild {
  guid: string;
  mime?: string;
  role: string;
  urn?: string;
  status?: string;
  progress?: string;
  type?: string;
  hasThumbnail: boolean;
  name?: string;
  objectIds?: number[];
}

export interface ManifestDerivative {
  hasThumbnail?: boolean;
  status?: string;
  progress?: string;
  outputType?: string;
  children?: ManifestChild[];
}

export interface ManifestResponse {
  type: string;
  hasThumbnail: string;
  status: string;
  progress: string;
  region: string;
  urn: string;
  version: string;
  derivatives: ManifestDerivative[];
}

export interface PropertyResponse {
  data: {
    collection: Array<{
      objectid: number;
      name?: string;
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

export interface TranslationJobResponse {
  result: string;
  urn: string;
  acceptedJobs: {
    output: {
      destination: {
        region: string;
      };
      formats: Array<{
        type: string;
        views?: string[];
        advanced?: {
          modelGuid?: string;
          objectIds?: number[];
        };
      }>;
    };
  };
}

export interface FormatOptions {
  type: string;
  views?: string[];
  advanced?: {
    modelGuid?: string;
    objectIds?: number[];
  };
}

export interface DerivativeRequest {
  input: {
    urn: string;
  };
  output: {
    destination: {
      region: string;
    };
    formats: FormatOptions[];
  };
}
